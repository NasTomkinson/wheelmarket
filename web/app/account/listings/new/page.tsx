import Link from "next/link";
import NewListingForm from "./_components/new-listing-form";

export default function NewListing() {
  return (
    <div className="mx-auto max-w-5xl pb-12">
      <Link href="/account/listings" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-neutral-dark/70 hover:text-primary">
        <span aria-hidden="true">←</span> Back to listings
      </Link>
      <div className="mb-7">
        <h1 className="text-3xl font-bold text-neutral-dark sm:text-4xl">Create a new listing</h1>
        <p className="mt-2 max-w-2xl text-neutral-dark/70">Add accurate details and clear images to help buyers find the right wheels.</p>
      </div>
      <NewListingForm />
    </div>
  );
}
