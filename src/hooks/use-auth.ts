import {useAuthActions} from "@convex-dev/auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import z from "zod"

const signInSchema = z.object({
    email: z.string().email(
        "Invalid Email Adresss"
    ),
    password: z.string().min(6, "Password must be atleast 6 charecters")
})
const signUpSchema = z.object({
    firstName: z.string().min(2, "First Name must be atleast have 2 charecters"),
    lastName: z.string().min(2, "First Name must be atleast have 2 charecters"),
    email: z.string().email(
        "Invalid Email Adresss"
    ),
    password: z.string().min(6, "Password must be atleast 6 charecters")
})

type SignInData = z.infer<typeof signInSchema>
type SignUpData = z.infer<typeof signUpSchema>

export const useAuth = () => {
    const { signIn, signOut } = useAuthActions()
    const router = useRouter()
    const [isLoading,setisLoading] = useState(false)

    const signInForm = useForm<SignInData>({
        resolver: zodResolver(signInSchema), 
        defaultValues: {
            email: "",
            password: "",
        }

    })
    const signUpForm = useForm<SignUpData>({
        resolver: zodResolver(signUpSchema), 
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
        }

    })


    const handleSignIn = async (data: SignInData) => {
        setisLoading(true)
        try {
            await signIn("password", {
                email: data.email,
                passwword: data.password,
                flow: "signIn"
            })
            router.push("/dashboard")
        } catch ( error) {
            console.log(error)
            signInForm.setError("password", {
                message: "Invalid email or password"
            })
        } finally {
            setisLoading(false)
        }
    }

    const handleSignUp = async (data: SignUpData) => {
        setisLoading(true)
        try {
            await signIn("password", {
                email: data.email,
                name:  `${data.firstName} ${data.lastName}`,
                password: data.password,
                flow: "signUp"
            })
            router.push("/dashboard")
        } catch (error) {
            console.log(error,  "SignUp Error")
            signUpForm.setError("root", {
                message: "Failed to create a account. Email may already exist"
            })
             
        } finally {
            setisLoading(false)
        }
        
    }

    const handleSignOut = async () => {
        try {
            await signOut()
            router.push("/auth/sign-in")
        } catch (error) {
            console.error("Sign Out Error", error)
        }
    }

    return {
        signInForm,
        signUpForm,
        handleSignIn,
        handleSignUp,
        handleSignOut,
        isLoading
    }
}