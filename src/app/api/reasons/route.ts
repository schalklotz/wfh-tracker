import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { CreateReasonSchema } from "@/lib/validations"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeAll = searchParams.get('includeAll') === 'true'

    const reasons = await prisma.reason.findMany({
      where: includeAll ? {} : { isActive: true },
      include: {
        _count: {
          select: { entries: true }
        }
      },
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(reasons)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch reasons" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateReasonSchema.parse(body)

    const reason = await prisma.reason.create({
      data: validatedData
    })

    return NextResponse.json(reason)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create reason" },
      { status: 500 }
    )
  }
}