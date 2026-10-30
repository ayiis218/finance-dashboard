// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StatusStamp } from "@/components/status-stamp";

afterEach(cleanup);

describe("StatusStamp", () => {
  it("renders its label as readable text", () => {
    render(<StatusStamp>Paid</StatusStamp>);
    expect(screen.getByText("Paid")).toBeTruthy();
  });

  it("forwards click handlers so it can stay interactive", () => {
    const onClick = vi.fn();
    render(<StatusStamp onClick={onClick}>Paid</StatusStamp>);
    fireEvent.click(screen.getByText("Paid"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
