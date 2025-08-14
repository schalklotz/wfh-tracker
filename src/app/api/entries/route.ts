import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { CreateWfhEntrySchema } from "@/lib/validations"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const staffId = searchParams.get('staffId')
    const reasonId = searchParams.get('reasonId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    
    const where: any = {}
    
    if (staffId) {
      where.staffId = staffId
    }
    
    if (reasonId) {
      where.reasonId = reasonId
    }
    
    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) {
        where.date.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.date.lte = new Date(dateTo)
      }
    }

    const entries = await prisma.wfhEntry.findMany({
      where,
      include: {
        staff: true,
        reason: true
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(entries)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch entries" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateWfhEntrySchema.parse(body)

    const entry = await prisma.wfhEntry.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
        createdBy: 'system'
      },
      include: {
        staff: true,
        reason: true
      }
    })

    return NextResponse.json(entry)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create entry" },
      { status: 500 }
    )
  }
}