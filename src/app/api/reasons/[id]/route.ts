import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/db"

import { UpdateReasonSchema } from "@/lib/validations"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication check
    // if (!session) {
    //   return NextResponse.json(
    //     { error: "Unauthorized" },
    //     { status: 401 }
    //   )
    // }

    const body = await request.json()
    const validatedData = UpdateReasonSchema.parse(body)

    const reason = await prisma.reason.update({
      where: { id: params.id },
      data: validatedData
    })

    return NextResponse.json(reason)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update reason" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication check
    // if (!session) {
    //   return NextResponse.json(
    //     { error: "Unauthorized" },
    //     { status: 401 }
    //   )
    // }

    await prisma.reason.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete reason" },
      { status: 500 }
    )
  }
}