import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/db"

import { UpdateStaffSchema } from "@/lib/validations"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = UpdateStaffSchema.parse(body)

    const staff = await prisma.staff.update({
      where: { id: params.id },
      data: validatedData
    })

    return NextResponse.json(staff)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update staff member" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
        { status: 401 }
      )
    }

    await prisma.staff.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete staff member" },
      { status: 500 }
    )
  }
}