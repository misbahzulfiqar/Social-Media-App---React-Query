import * as z from "zod"
import { AppwriteException } from "appwrite"
import { zodResolver } from "@hookform/resolvers/zod"
import { Camera } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loading } from "@/shared/Loading"

import { SigninValidation } from "@/lib/validation"
import { useSignInAccount } from "@/lib/react-query/queriesAndMutations"
import { useUserContext } from "@/context/authContext"

const SigninForm = () => {
  const navigate = useNavigate()
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext()

  const { mutateAsync: signInAccount, isPending } = useSignInAccount()

  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const handleSignin = async (user: z.infer<typeof SigninValidation>) => {
    try {
      const session = await signInAccount(user)

      if (!session) {
        toast.error("Login failed. Please try again.")
        return
      }

      const isLoggedIn = await checkAuthUser()

      if (isLoggedIn) {
        form.reset()
        navigate("/")
      } else {
        toast.error(
          "Session started but no user profile was found. In Appwrite, add a Users document for this account (accountId = Auth user id) or fix collection permissions."
        )
      }
    } catch (error) {
      console.error(error)
      if (error instanceof AppwriteException) {
        const msg = error.message || String(error.code)
        const lower = msg.toLowerCase()
        if (
          error.code === 401 ||
          lower.includes("invalid credentials") ||
          lower.includes("unauthorized")
        ) {
          toast.error(
            "Email or password is incorrect. If you just signed up, confirm signup finished without errors."
          )
        } else {
          toast.error(msg)
        }
      } else if (error instanceof Error && error.message) {
        toast.error(error.message)
      } else {
        toast.error("Login failed. Please try again.")
      }
    }
  }

  const inputClassName =
    "h-10 rounded-[10px] border-0 bg-[#1f1f22] px-3 text-[13px] leading-tight text-white shadow-none placeholder:text-neutral-500 focus-visible:border-0 focus-visible:ring-1 focus-visible:ring-[#9f7aea]/45"

  return (
    <Form {...form}>
      <div className="flex w-full max-w-[320px] flex-col items-center text-center">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] via-[#7c3aed] to-[#4f46e5] shadow-[0_0_12px_rgba(139,92,246,0.3)]"
            aria-hidden
          >
            <Camera className="h-[14px] w-[14px] text-white" strokeWidth={2} />
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            Snapgram
          </span>
        </div>

        <h1 className="mt-3 text-lg font-bold leading-snug tracking-tight text-white sm:text-xl">
          Log in to your account
        </h1>
        <p className="mt-1 max-w-[280px] text-[11px] leading-snug text-[#9b8aad] sm:text-xs">
          Welcome back! Please enter your details
        </p>

        <form
          onSubmit={form.handleSubmit(handleSignin)}
          className="mt-4 flex w-full flex-col gap-3 text-left"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-[11px] font-medium text-white sm:text-xs">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    className={inputClassName}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[10px] leading-tight text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-[11px] font-medium text-white sm:text-xs">
                  Password
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    className={inputClassName}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[10px] leading-tight text-red-400" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="mt-0.5 h-10 w-full rounded-[10px] border-0 bg-[#b197fc] text-xs font-semibold text-white shadow-none hover:bg-[#a084f8] focus-visible:ring-1 focus-visible:ring-[#c4b5fd]/60 sm:text-[13px]"
          >
            {isPending || isUserLoading ? (
              <span className="flex items-center justify-center gap-1.5">
                <Loading className="size-3.5" /> Loading...
              </span>
            ) : (
              "Sign in"
            )}
          </Button>

          <p className="text-center text-[11px] text-white sm:text-xs">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-[#c4b5fd] transition-colors hover:text-[#ddd6fe]"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </Form>
  )
}

export default SigninForm
