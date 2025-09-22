import { NextResponse } from 'next/server'
import { ChallengeService } from '@/lib/challenges'

export async function GET() {
  try {
    const challengeDefinitions = ChallengeService.getAllChallengeDefinitions()
    
    console.log('🧪 Test getAllChallengeDefinitions')
    console.log('📋 Challenge definizioni:', challengeDefinitions.length)
    
    challengeDefinitions.forEach(challenge => {
      console.log(`📋 Challenge ${challenge.id}: ${challenge.title} - Status: ${challenge.status}`)
    })

    return NextResponse.json({ 
      success: true, 
      challenges: challengeDefinitions.slice(0, 3),
      count: challengeDefinitions.length
    })

  } catch (error) {
    console.error('❌ Errore test challenge definitions:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Errore test' 
    }, { status: 500 })
  }
}
