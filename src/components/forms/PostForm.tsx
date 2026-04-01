import * as z from "zod";
import { AppwriteException } from "appwrite";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PostValidation } from "@/lib/validation";
import { toast } from "sonner";
import { useUserContext } from "@/context/authContext";
import { FileUploader } from "@/components/shared";
import { Loading } from "@/shared/Loading";
import { useCreatePost, useUpdatePost } from "@/lib/react-query/queriesAndMutations";
import { getPostDisplayImageUrl } from "@/lib/appwrite/api";
import type { IPostDoc } from "@/types";

type PostFormProps = {
  post?: IPostDoc;
  action: "Create" | "Update";
};

const PostForm = ({ post, action }: PostFormProps) => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post ? post.caption : "",
      file: [],
      location: post ? post.location ?? "" : "",
      tags: post
        ? Array.isArray(post.tags)
          ? post.tags.join(",")
          : ""
        : "",
    },
  });

  // Query
  const { mutateAsync: createPost, isPending: isPendingCreate } =
    useCreatePost();
  const { mutateAsync: updatePost, isPending: isPendingUpdate } =
    useUpdatePost();

  const toastError = (error: unknown, fallback: string) => {
    const msg =
      error instanceof AppwriteException
        ? error.message
        : error instanceof Error
          ? error.message
          : fallback;
    toast.error(msg);
  };

  // Handler
  const handleSubmit = async (value: z.infer<typeof PostValidation>) => {
    if (post && action === "Update") {
      try {
        const updatedPost = await updatePost({
          ...value,
          postId: post.$id,
          imageId: post.imageId,
          imageUrl: post.imageUrl,
        });

        if (!updatedPost) {
          toast.error(`${action} post failed. Please try again.`);
          return;
        }
        navigate(`/posts/${post.$id}`);
      } catch (error) {
        toastError(error, `${action} post failed. Please try again.`);
      }
      return;
    }

    if (!user.id) {
      toast.error("You need to be signed in to create a post.");
      return;
    }

    try {
      const newPost = await createPost({
        ...value,
        userId: user.id,
      });

      if (!newPost) {
        toast.error(`${action} post failed. Please try again.`);
        return;
      }
      navigate("/");
    } catch (error) {
      toastError(error, `${action} post failed. Please try again.`);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-9 w-full  max-w-5xl">
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Caption</FormLabel>
              <FormControl>
                <Textarea
                  className="shad-textarea custom-scrollbar"
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Photos</FormLabel>
              <FormControl>
                <FileUploader
                  fieldChange={field.onChange}
                  mediaUrl={post ? getPostDisplayImageUrl(post) : ""}
                  storageFileId={post?.imageId}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Location</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">
                Add Tags (separated by comma " , ")
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Art, Expression, Learn"
                  type="text"
                  className="shad-input"
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <div className="flex gap-4 items-center justify-end">
          <Button
            type="button"
            className="shad-button_dark_4"
            onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isPendingCreate || isPendingUpdate}>
            {(isPendingCreate || isPendingUpdate) && <Loading />}
            {action} Post
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;




