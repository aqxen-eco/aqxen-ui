import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tag } from "@/components/ui/tag";

export default function BadgeAutomationPage() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">Sym</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="w-40">Emitter criteria</TableHead>
          <TableHead className="w-40">Emit badges</TableHead>
          <TableHead className="w-32">Status</TableHead>
          <TableHead className="w-[5.5rem]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="text-gray-3">SYM</TableCell>
          <TableCell className="space-x-2">
            <span className="inline-block">Name</span>
            <Tag>Cyclic</Tag>
          </TableCell>
          <TableCell>Badges</TableCell>
          <TableCell>Badges</TableCell>
          <TableCell>
            <Tag variant="green">Enabled</Tag>
          </TableCell>
          <TableCell className="text-right">
            <Button variant="secondary" size="md">
              Disable
            </Button>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="text-gray-3">SYM</TableCell>
          <TableCell className="space-x-2 text-nowrap">
            <span className="inline-block">Name</span>
            <Tag>Cyclic</Tag>
          </TableCell>
          <TableCell>Badges</TableCell>
          <TableCell>Badges</TableCell>
          <TableCell>
            <Tag variant="red">Disabled</Tag>
          </TableCell>
          <TableCell className="text-right">
            <Button variant="secondary" size="md">
              Enable
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
