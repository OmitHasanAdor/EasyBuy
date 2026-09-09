import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function ProfileSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const dbUser = await prisma.user.findUnique({
    where: { id: session!.user.id },
  });

  async function updateProfile(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;

    await prisma.user.update({
      where: { id: session!.user.id },
      data: { name, phone: phone || null },
    });

    revalidatePath("/dashboard/buyer/settings");
  }

  return (
    <div className="px-6 py-8 sm:px-10">
      <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
        Profile Settings
      </h1>
      <p className="mt-1 text-sm text-[#5B5145]">
        Update your personal information.
      </p>

      <form
        action={updateProfile}
        className="mt-8 max-w-lg rounded-lg border border-[#E7DCC4] bg-white p-6"
      >
        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-medium text-[#2B2420]">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            defaultValue={dbUser?.name}
            required
            className="w-full rounded-md border border-[#E7DCC4] px-3.5 py-2.5 text-sm outline-none focus:border-[#C05620]"
          />
        </div>

        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-medium text-[#2B2420]">
            Email
          </label>
          <input
            type="email"
            value={dbUser?.email}
            disabled
            className="w-full rounded-md border border-[#E7DCC4] bg-[#F7F2E7] px-3.5 py-2.5 text-sm text-[#8E3D14]/70"
          />
          <p className="mt-1 text-xs text-[#8E3D14]/60">Email can&apos;t be changed.</p>
        </div>

        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-medium text-[#2B2420]">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            defaultValue={dbUser?.phone ?? ""}
            placeholder="+880 1XXX XXXXXX"
            className="w-full rounded-md border border-[#E7DCC4] px-3.5 py-2.5 text-sm outline-none focus:border-[#C05620]"
          />
        </div>

        <button
          type="submit"
          className="rounded-sm bg-[#2B2420] px-6 py-2.5 text-sm font-semibold text-[#F7F2E7] transition-opacity hover:opacity-90"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}