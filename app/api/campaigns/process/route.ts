import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function POST(request: Request) {
  try {
    const { campaignId } = await request.json()

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*, contact_lists(id)')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Get contacts for the campaign
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .eq('list_id', campaign.contact_lists.id)

    if (contactsError) {
      return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
    }

    // Update campaign status to processing
    await supabase
      .from('campaigns')
      .update({
        status: 'processing',
        progress: 0,
        sent_messages: 0,
        failed_messages: 0
      })
      .eq('id', campaignId)

    // Process each contact
    let sent = 0
    let failed = 0

    for (const contact of contacts) {
      try {
        // Replace variables in message template
        let message = campaign.message_template
        Object.entries(contact).forEach(([key, value]) => {
          message = message.replace(new RegExp(`{{${key}}}`, 'g'), value as string)
        })

        // TODO: Integrate with actual messaging service
        // For now, simulate message sending with a delay
        await sleep(500)

        // Random success/failure for demonstration
        if (Math.random() > 0.1) {
          sent++
        } else {
          failed++
          console.error(`Failed to send message to ${contact.phone}`)
        }

        // Update progress
        const progress = Math.round(((sent + failed) / contacts.length) * 100)
        await supabase
          .from('campaigns')
          .update({
            progress,
            sent_messages: sent,
            failed_messages: failed
          })
          .eq('id', campaignId)
      } catch (error) {
        failed++
        console.error(`Error processing contact ${contact.id}:`, error)
      }
    }

    // Update final status
    await supabase
      .from('campaigns')
      .update({
        status: failed === contacts.length ? 'failed' : 'completed',
        progress: 100
      })
      .eq('id', campaignId)

    return NextResponse.json({
      success: true,
      sent,
      failed
    })
  } catch (error) {
    console.error('Campaign processing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 