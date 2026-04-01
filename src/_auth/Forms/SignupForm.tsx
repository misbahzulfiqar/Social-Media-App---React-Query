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
import { useCreateUserAccount } from "@/lib/react-query/queriesAndMutations"
import { SignupValidation } from "@/lib/validation"
import { useUserContext } from "@/context/authContext"

const SignupForm = () => {
  const navigate = useNavigate()
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext()

  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  })

  const { mutateAsync: createUserAccount, isPending: isCreatingAccount } =
    useCreateUserAccount()

  const handleSignup = async (user: z.infer<typeof SignupValidation>) => {
    try {
      const newUser = await createUserAccount(user)

      if (!newUser) {
        toast.error("Sign up failed. Please try again.")
        return
      }

      const isLoggedIn = await checkAuthUser()

      if (isLoggedIn) {
        form.reset()
        navigate("/signin")
      } else {
        toast.error(
          "Account created but profile could not be loaded. Check your Users collection has accountId, email, name, and username attributes, then sign in."
        )
      }
    } catch (error) {
      console.error(error)
      if (error instanceof AppwriteException) {
        toast.error(error.message)
      } else {
        toast.error("Something went wrong. Please try again.")
      }
    }
  }

  const inputClassName =
    "h-9 rounded-md border-0 bg-[#1c1c1e] px-3 text-[13px] leading-tight text-white shadow-none placeholder:text-neutral-500 focus-visible:border-0 focus-visible:ring-1 focus-visible:ring-[#9f7aea]/45"

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
          Create a new account
        </h1>
        <p className="mt-1 max-w-[280px] text-[11px] leading-snug text-[#9b8aad] sm:text-xs">
          To use Snapgram, please enter your details
        </p>

        <form
          onSubmit={form.handleSubmit(handleSignup)}
          className="mt-4 flex w-full flex-col gap-3 text-left"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-[11px] font-medium text-white sm:text-xs">
                  Name
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    autoComplete="name"
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
            name="username"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-[11px] font-medium text-white sm:text-xs">
                  Username
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    autoComplete="username"
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
                    autoComplete="new-password"
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
            className="mt-0.5 h-9 w-full rounded-md border-0 bg-[#b197fc] text-xs font-semibold text-white shadow-none hover:bg-[#a084f8] focus-visible:ring-1 focus-visible:ring-[#c4b5fd]/60 sm:text-[13px]"
          >
            {isCreatingAccount || isUserLoading ? (
              <span className="flex items-center justify-center gap-1.5">
                <Loading className="size-3.5" /> Loading...
              </span>
            ) : (
              "Sign up"
            )}
          </Button>

          <p className="text-center text-[11px] text-white sm:text-xs">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="font-semibold text-[#c4b5fd] transition-colors hover:text-[#ddd6fe]"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </Form>
  )
}

export default SignupForm
