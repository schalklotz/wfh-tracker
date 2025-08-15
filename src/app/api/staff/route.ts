import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { CreateStaffSchema } from "@/lib/validations"

export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      include: {
        _count: {
          select: { entries: true }
        }
      },
      orderBy: { fullName: 'asc' }
    })
    return NextResponse.json(staff)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateStaffSchema.parse(body)

    const staff = await prisma.staff.create({
      data: validatedData
    })

    return NextResponse.json(staff)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create staff member" },
      { status: 500 }
    )
  }
}