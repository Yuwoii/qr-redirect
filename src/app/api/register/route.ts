import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcrypt";
import { userRepository } from "../../../lib/db-client";

// Schema for user registration
const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { name, email, password } = validationResult.data;
    
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }
    
    // Hash the password
    const hashedPassword = await hash(password, 10);
    
    // Create the user
    const user = await userRepository.create({
      name,
      email,
      password: hashedPassword
    });
    
    // Don't return the password
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
} 