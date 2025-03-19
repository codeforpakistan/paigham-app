import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendBulkSMS } from '@/lib/sms'
import { getServerSession } from '@/lib/server-session'

export async function POST(request: Request) {
  try {
    console.log('Starting campaign processing...')
    
    // Get session from cookie
    const session = getServerSession()
    console.log('Session details:', {
      exists: !!session,
      company_id: session?.company_id,
      user_id: session?.user?.id
    })
    
    if (!session?.company_id) {
      console.error('No valid session or company_id found')
      return NextResponse.json(
        { error: 'Unauthorized - No valid session' },
        { status: 401 }
      )
    }

    const { campaignId } = await request.json()
    console.log('Campaign ID:', campaignId)
    
    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    // Get campaign details with company_id check
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        *,
        contact_list:contact_lists (
          contacts (
            phone
          )
        )
      `)
      .eq('id', campaignId)
      .eq('company_id', session.company_id)
      .single()

    if (campaignError) {
      console.error('Campaign fetch error:', campaignError)
      return NextResponse.json(
        { error: 'Failed to fetch campaign' },
        { status: 500 }
      )
    }

    if (!campaign) {
      console.error('Campaign not found or unauthorized')
      return NextResponse.json(
        { error: 'Campaign not found or unauthorized' },
        { status: 404 }
      )
    }

    console.log('Campaign found:', campaign.id)

    // Update campaign status to processing
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ status: 'processing' })
      .eq('id', campaignId)

    if (updateError) {
      console.error('Failed to update campaign status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update campaign status' },
        { status: 500 }
      )
    }

    // Get all contacts from the contact list
    const contacts = campaign.contact_list.contacts
    console.log(`Found ${contacts.length} contacts to process`)

    // Process the campaign
    const results = await sendBulkSMS(
      contacts,
      campaign.message_template,
      async (progress) => {
        console.log(`Campaign progress: ${progress}%`)
        // Update campaign progress
        await supabase
          .from('campaigns')
          .update({ progress })
          .eq('id', campaignId)
      }
    )

    console.log('Campaign processing results:', results)

    // Update campaign with final results
    const { error: finalUpdateError } = await supabase
      .from('campaigns')
      .update({
        status: results.success ? 'completed' : 'failed',
        sent_messages: results.sent,
        failed_messages: results.failed,
        progress: 100
      })
      .eq('id', campaignId)

    if (finalUpdateError) {
      console.error('Failed to update final campaign status:', finalUpdateError)
      return NextResponse.json(
        { error: 'Failed to update final campaign status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Campaign processed: ${results.sent} sent, ${results.failed} failed`,
      results
    })
  } catch (error) {
    console.error('Campaign processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process campaign' },
      { status: 500 }
    )
  }
} 