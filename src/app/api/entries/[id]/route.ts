import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { UpdateWfhEntrySchema } from "@/lib/validations"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = UpdateWfhEntrySchema.parse(body)

    // Check if entry exists
    const existingEntry = await prisma.wfhEntry.findUnique({
      where: { id: params.id },
      include: { staff: true }
    })

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Entry not found" },
        { status: 404 }
      )
    }

    const entry = await prisma.wfhEntry.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        date: new Date(validatedData.date)
      },
      include: {
        staff: true,
        reason: true
      }
    })

    return NextResponse.json(entry)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if entry exists
    const existingEntry = await prisma.wfhEntry.findUnique({
      where: { id: params.id }
    })

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Entry not found" },
        { status: 404 }
      )
    }

    await prisma.wfhEntry.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    )
  }
}