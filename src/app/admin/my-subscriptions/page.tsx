import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip } from "@/components/ui/tooltip";
import { MdOutlineInfo } from "react-icons/md";

export default function MySubscriptionPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <header className="flex-1 flex items-center gap-1">
          <h2 className="text-title-2 text-white">Upcoming</h2>
          <Tooltip content="Lorem ipsum dolor sit amet">
            <Button variant="link" size="md" square>
              <MdOutlineInfo className="size-6" />
            </Button>
          </Tooltip>
        </header>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead className="text-center">Recognitions</TableHead>
              <TableHead className="text-center">Term</TableHead>
              <TableHead className="text-center">Investment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="py-6">1</TableCell>
              <TableCell className="py-6">Beginner</TableCell>
              <TableCell className="text-center py-6">1,000</TableCell>
              <TableCell className="text-center py-6">1 month</TableCell>
              <TableCell className="text-center py-6">1,000,000 WRAM</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-6">2</TableCell>
              <TableCell className="py-6">Beginner</TableCell>
              <TableCell className="text-center py-6">1,000</TableCell>
              <TableCell className="text-center py-6">1 month</TableCell>
              <TableCell className="text-center py-6">1,000,000 WRAM</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <section className="space-y-2">
        <header className="flex-1 flex items-center gap-1">
          <h2 className="text-title-2 text-white">Used</h2>
          <Tooltip content="Lorem ipsum dolor sit amet">
            <Button variant="link" size="md" square>
              <MdOutlineInfo className="size-6" />
            </Button>
          </Tooltip>
        </header>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead className="text-center">Recognitions</TableHead>
              <TableHead className="text-center">Term</TableHead>
              <TableHead className="text-center">Investment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="py-6">1</TableCell>
              <TableCell className="py-6">Beginner</TableCell>
              <TableCell className="text-center py-6">1,000</TableCell>
              <TableCell className="text-center py-6">1 month</TableCell>
              <TableCell className="text-center py-6">1,000,000 WRAM</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-6">2</TableCell>
              <TableCell className="py-6">Beginner</TableCell>
              <TableCell className="text-center py-6">1,000</TableCell>
              <TableCell className="text-center py-6">1 month</TableCell>
              <TableCell className="text-center py-6">1,000,000 WRAM</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
