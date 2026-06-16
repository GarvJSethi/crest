import { getUserAddresses } from "@/features/account/queries/get-addresses";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Saved Addresses | Crest",
};

export default async function AddressesPage() {
  const addresses = await getUserAddresses();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif tracking-tight mb-2">Saved Addresses</h1>
          <p className="text-muted-foreground">Manage your shipping and billing addresses.</p>
        </div>
        <Button className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Add New Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="border rounded-xl p-12 text-center bg-muted/20">
          <p className="text-muted-foreground mb-6 text-lg">You haven't saved any addresses yet.</p>
          <Button variant="outline">Add Your First Address</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address: any) => (
            <div key={address.id} className="border rounded-xl p-6 flex flex-col h-full relative">
              {address.is_default && (
                <span className="absolute top-4 right-4 text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                  Default {address.address_type}
                </span>
              )}
              
              <div className="mb-4 pr-24">
                <h3 className="font-semibold text-lg">{address.full_name}</h3>
                <p className="text-sm text-muted-foreground">{address.phone}</p>
              </div>
              
              <div className="text-sm text-muted-foreground flex-1 space-y-1 mb-6">
                <p>{address.address_line_1}</p>
                {address.address_line_2 && <p>{address.address_line_2}</p>}
                <p>{address.city}, {address.state} {address.postal_code}</p>
                <p>{address.country}</p>
                {address.landmark && <p>Landmark: {address.landmark}</p>}
              </div>
              
              <div className="flex gap-4 border-t pt-4 mt-auto">
                <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                <Button variant="ghost" size="sm" className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10">Remove</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
