'use server'

import { createClient } from "@/lib/supabase/server"

export type Category = {
    id: string
    key: string
    name: string
    description: string | null
    icon: string | null
    order_index: number
}

export type Job = {
    id: string
    key: string
    name: string
    description: string | null
    icon: string | null
    order_index: number
}

export type Template = {
    id: string
    key: string
    name: string
    tagline: string
    description: string | null
    category_id: string | null
    job_id: string | null
    difficulty: 'basic' | 'advanced'
    risk_level: 'low' | 'medium' | 'high'
    outputs: string[]
    is_featured: boolean
    is_verified: boolean
    version: string
    status: 'active' | 'draft' | 'archived'
    estimated_time_minutes: number
    category?: Category
    job?: Job
}

export type UserIntent = {
    workspace_id: string
    primary_job_id: string | null
    secondary_job_ids: string[]
    industries: string[]
    stage: 'idea' | 'mvp' | 'growth' | 'scale' | null
}

/**
 * Get all jobs (JTBD)
 */
export async function getJobs(): Promise<Job[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('table_jobs')
        .select('*')
        .order('order_index', { ascending: true })

    if (error) {
        console.error('Error fetching jobs:', error)
        return []
    }

    return data || []
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('table_categories')
        .select('*')
        .order('order_index', { ascending: true })

    if (error) {
        console.error('Error fetching categories:', error)
        return []
    }

    return data || []
}

/**
 * List templates with optional filters
 */
export async function listTemplates(filters?: {
    category?: string
    job?: string
    difficulty?: 'basic' | 'advanced'
    risk?: 'low' | 'medium' | 'high'
    query?: string
    featured?: boolean
}): Promise<Template[]> {
    const supabase = await createClient()

    let query = supabase
        .from('table_templates')
        .select(`
            *,
            category:table_categories(*),
            job:table_jobs(*)
        `)
        .eq('status', 'active')

    // Apply filters
    if (filters?.category) {
        query = query.eq('category_id', filters.category)
    }
    if (filters?.job) {
        query = query.eq('job_id', filters.job)
    }
    if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty)
    }
    if (filters?.risk) {
        query = query.eq('risk_level', filters.risk)
    }
    if (filters?.featured !== undefined) {
        query = query.eq('is_featured', filters.featured)
    }
    if (filters?.query) {
        query = query.or(`name.ilike.%${filters.query}%,tagline.ilike.%${filters.query}%,description.ilike.%${filters.query}%`)
    }

    const { data, error } = await query.order('is_featured', { ascending: false })
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching templates:', error)
        return []
    }

    return data || []
}

/**
 * Get single template by key
 */
export async function getTemplate(templateKey: string): Promise<Template | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('table_templates')
        .select(`
            *,
            category:table_categories(*),
            job:table_jobs(*)
        `)
        .eq('key', templateKey)
        .eq('status', 'active')
        .single()

    if (error) {
        console.error('Error fetching template:', error)
        return null
    }

    return data
}

/**
 * Recommend templates for workspace
 * Deterministic-first recommendation engine
 */
export async function recommendTemplates(
    workspaceId: string,
    limit: number = 3
): Promise<Template[]> {
    const supabase = await createClient()

    // 1. Get user intent
    const { data: intent } = await supabase
        .from('user_intents')
        .select('*')
        .eq('workspace_id', workspaceId)
        .single()

    // 2. Get workspace subscription plan
    const { data: workspace } = await supabase
        .from('workspaces')
        .select('subscription_plan')
        .eq('id', workspaceId)
        .single()

    const plan = workspace?.subscription_plan || 'free'

    // 3. Build query
    let query = supabase
        .from('table_templates')
        .select(`
            *,
            category:table_categories(*),
            job:table_jobs(*)
        `)
        .eq('status', 'active')

    // Filter by job if intent exists
    if (intent?.primary_job_id) {
        query = query.or(`job_id.eq.${intent.primary_job_id},is_featured.eq.true`)
    } else {
        // No intent: show only featured
        query = query.eq('is_featured', true)
    }

    // Gating: free users only see basic templates
    if (plan === 'free') {
        query = query.eq('difficulty', 'basic')
        query = query.neq('risk_level', 'high')
    }

    const { data, error } = await query
        .order('is_featured', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error recommending templates:', error)
        return []
    }

    return data || []
}

/**
 * Save user intent
 */
export async function saveUserIntent(
    workspaceId: string,
    payload: Partial<UserIntent>
): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('user_intents')
        .upsert({
            workspace_id: workspaceId,
            ...payload,
            updated_at: new Date().toISOString()
        })

    if (error) {
        console.error('Error saving user intent:', error)
        throw new Error('Failed to save user intent')
    }
}

/**
 * Track template view (telemetry)
 */
export async function trackTemplateView(
    templateId: string,
    workspaceId?: string
): Promise<void> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('events').insert({
        event_name: 'template_viewed',
        payload: { template_id: templateId },
        user_id: user?.id || null,
        workspace_id: workspaceId || null
    })
}

/**
 * Track job selection (telemetry)
 */
export async function trackJobSelected(
    jobId: string,
    jobKey: string,
    workspaceId?: string
): Promise<void> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('events').insert({
        event_name: 'job_selected',
        payload: { job_id: jobId, job_key: jobKey },
        user_id: user?.id || null,
        workspace_id: workspaceId || null
    })
}

/**
 * Track library viewed (telemetry)
 */
export async function trackLibraryViewed(
    filters?: Record<string, unknown>,
    workspaceId?: string
): Promise<void> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('events').insert({
        event_name: 'library_viewed',
        payload: { filters },
        user_id: user?.id || null,
        workspace_id: workspaceId || null
    })
}
