import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function BuySubscriptionPage() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tier</TableHead>
          <TableHead className="text-center">Recognitions</TableHead>
          <TableHead className="text-center">Term</TableHead>
          <TableHead className="text-center">Investment</TableHead>
          <TableHead className="w-16" />
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Beginner</TableCell>
          <TableCell className="text-center">1,000</TableCell>
          <TableCell className="text-center">1 month</TableCell>
          <TableCell className="text-center">1,000,000 WRAM</TableCell>
          <TableCell className="text-right">
            <Button variant="secondary" size="md">
              Buy
            </Button>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Small</TableCell>
          <TableCell className="text-center">10</TableCell>
          <TableCell className="text-center">1 month</TableCell>
          <TableCell className="text-center">50,000 WRAM</TableCell>
          <TableCell className="text-right">
            <Button variant="secondary" size="md">
              Buy
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
