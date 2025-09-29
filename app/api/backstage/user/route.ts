import { NextResponse } from "next/server";
import { getSelf } from "@/lib/auth-service";

export async function GET() {
  try {
    const self = await getSelf();
    
    if (!self) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Return minimal user data for backstage
    const userData = {
      id: self.id,
      username: self.username,
      imageUrl: self.imageUrl,
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error("[API] /api/backstage/user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
