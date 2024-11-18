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

export default function AtiveSubscriptionPage() {
  return (
    <div className="space-y-8">
      <Box className="p-6 flex items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-body-1">Cyclic Fee</h2>
          <p className="text-body-3 text-gray-3">
            Additional series and members costs.
          </p>
        </div>
        <div className="flex-none">
          <Button variant="primary" size="md">
            Pay 10 EOS
          </Button>
        </div>
      </Box>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tier</TableHead>
            <TableHead className="text-center">Remaining Recognition</TableHead>
            <TableHead className="text-center">Ends in</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="py-6">Beginner</TableCell>
            <TableCell className="text-center py-6">1,000</TableCell>
            <TableCell className="text-center py-6">25 days</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <section className="space-y-2">
        <header className="flex-1 flex items-center gap-1">
          <h2 className="text-title-2 text-white">Perks</h2>
          <Tooltip content="Lorem ipsum dolor sit amet">
            <Button variant="link" size="md" square>
              <MdOutlineInfo className="size-6" />
            </Button>
          </Tooltip>
        </header>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead className="text-center">Free</TableHead>
              <TableHead className="text-center">Used</TableHead>
              <TableHead className="text-center">Paid</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="py-6">Series</TableCell>
              <TableCell className="text-center py-6">1</TableCell>
              <TableCell className="text-center py-6">1</TableCell>
              <TableCell className="text-center py-6">0</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-6">Members</TableCell>
              <TableCell className="text-center py-6">3</TableCell>
              <TableCell className="text-center py-6">5</TableCell>
              <TableCell className="text-center py-6">2</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <section className="space-y-2">
        <header className="flex-1 flex items-center gap-1">
          <h2 className="text-title-2 text-white">Cycles</h2>
          <Tooltip content="Lorem ipsum dolor sit amet">
            <Button variant="link" size="md" square>
              <MdOutlineInfo className="size-6" />
            </Button>
          </Tooltip>
        </header>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead className="text-center">Start</TableHead>
              <TableHead className="text-center">End</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="py-6">1</TableCell>
              <TableCell className="text-center py-6">
                2024-11-12 00:00
              </TableCell>
              <TableCell className="text-center py-6">
                2024-11-26 23:59
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-6">2</TableCell>
              <TableCell className="text-center py-6">
                2024-11-12 00:00
              </TableCell>
              <TableCell className="text-center py-6">
                2024-11-26 23:59
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
