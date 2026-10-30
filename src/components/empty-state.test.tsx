// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EmptyState, TableEmptyRow } from "@/components/empty-state";
import { Table, TableBody } from "@/components/ui/table";

afterEach(cleanup);

describe("EmptyState", () => {
  it("shows the friendly message", () => {
    render(<EmptyState>Belum ada transaksi.</EmptyState>);
    expect(screen.getByText("Belum ada transaksi.")).toBeTruthy();
  });

  it("spans the whole table when used as a row", () => {
    render(
      <Table>
        <TableBody>
          <TableEmptyRow colSpan={5}>Kosong</TableEmptyRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByText("Kosong").closest("td")?.getAttribute("colspan")).toBe("5");
  });
});
