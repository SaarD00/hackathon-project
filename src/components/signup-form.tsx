import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export function SignUpForm({
  className,
  handleSubmit,
  handleSignUp,
  register,
  isLoading,
  errors,
  ...props
}: any) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-[#050505] border border-white/5 shadow-2xl rounded-xl">
        <CardHeader className="text-center pb-8 pt-6">
          <CardTitle className="text-2xl font-medium tracking-tight text-white">Create your account</CardTitle>
          <CardDescription className="text-neutral-500 font-light">
            Enter your details below to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleSignUp)}>
            <FieldGroup>
              <Field className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="firstName" className="text-neutral-400 font-medium text-xs">First Name</FieldLabel>
                  <Input id="firstName" type="text" placeholder="John" {...register("firstName")} required className={cn("bg-[#111] border-white/5 text-white placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-white/20 h-11 rounded-md", errors.firstName ? "border-red-500/50 focus-visible:ring-red-500/50" : "")} />
                  {errors.firstName && (
                    <p className="text-xs text-red-400">{errors.firstName.message}</p>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName" className="text-neutral-400 font-medium text-xs">Last Name</FieldLabel>
                  <Input id="lastName" type="text" placeholder="Doe" {...register("lastName")} required className={cn("bg-[#111] border-white/5 text-white placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-white/20 h-11 rounded-md", errors.lastName ? "border-red-500/50 focus-visible:ring-red-500/50" : "")} />
                  {errors.lastName && (
                    <p className="text-xs text-red-400">{errors.lastName.message}</p>
                  )}
                </Field>
              </Field>
              <Field>
                <FieldLabel htmlFor="email" className="text-neutral-400 font-medium text-xs">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  required
                  className={cn("bg-[#111] border-white/5 text-white placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-white/20 h-11 rounded-md", errors.email ? "border-red-500/50 focus-visible:ring-red-500/50" : "")}
                />
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email.message}</p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="password" className="text-neutral-400 font-medium text-xs">Password</FieldLabel>
                <Input id="password" type="password" {...register("password")} required className={cn("bg-[#111] border-white/5 text-white focus-visible:ring-1 focus-visible:ring-white/20 h-11 rounded-md", errors.password ? "border-red-500/50 focus-visible:ring-red-500/50" : "")} />
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password.message}</p>
                )}
                {!errors.password && (
                  <FieldDescription className="text-neutral-500 text-xs">
                    Must be at least 8 characters long.
                  </FieldDescription>
                )}
              </Field>
              {errors.root && (
                <p className="text-xs text-red-400 text-center">{errors.root.message}</p>
              )}
              <Field className="pt-4">
                <Button disabled={isLoading} type="submit" className="w-full bg-white hover:bg-neutral-200 text-black h-11 rounded-md font-medium transition-colors">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : "Create Account"}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-[#050505] text-neutral-600 py-2 font-mono text-[10px] uppercase tracking-wider">
                Or continue with
              </FieldSeparator>
              <Field className="grid grid-cols-2 gap-4">
                <Button variant="outline" type="button" className="bg-transparent hover:bg-white/5 border border-white/10 text-white transition-colors h-11 rounded-md font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  Apple
                </Button>
                <Button variant="outline" type="button" className="bg-transparent hover:bg-white/5 border border-white/10 text-white transition-colors h-11 rounded-md font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Google
                </Button>
              </Field>
              <FieldDescription className="text-center text-neutral-500 pt-5">
                Already have an account? <Link href="/auth/sign-in" className="text-white hover:underline transition-colors">Sign in</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center text-xs text-neutral-600">
        By clicking continue, you agree to our <a href="#" className="hover:text-white transition-colors">Terms of Service</a>{" "}
        and <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
