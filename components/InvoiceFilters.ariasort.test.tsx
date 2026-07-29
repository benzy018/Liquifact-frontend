/**
 * @file InvoiceFilters.ariasort.test.tsx
 *
 * Comprehensive tests for aria-sort support on marketplace sort controls.
 *
 * Areas covered
 * ─────────────
 * 1. getAriaSort – maps column + direction to aria-sort values
 * 2. getSortAnnouncement – formats sort announcements for the live region
 * 3. InvoiceFilters fieldset – aria-sort reflects active sort state
 * 4. DirectionToggle aria-label – accessible name describes the action
 * 5. Sort live region – announces sort changes without duplicating
 *    the marketplace results-summary
 * 6. aria-sort transitions – toggling direction updates aria-sort
 */

import "@testing-library/jest-dom";
import { render, screen, fireEvent, act } from "@testing-library/react";
import InvoiceFilters, {
  DEFAULT_FILTERS,
  getAriaSort,
  getSortAnnouncement,
  SORT_OPTIONS,
} from "./InvoiceFilters";

// ─── Shared fixtures ──────────────────────────────────────────────────────

const BASE = { ...DEFAULT_FILTERS };

function filtersWith(overrides: Partial<typeof DEFAULT_FILTERS>) {
  return { ...BASE, ...overrides };
}

// ─── 1. getAriaSort ───────────────────────────────────────────────────────

describe("getAriaSort", () => {
  it('returns "none" when column is empty', () => {
    expect(getAriaSort("", "desc")).toBe("none");
  });

  it('returns "none" when column is an empty string regardless of dir', () => {
    expect(getAriaSort("", "asc")).toBe("none");
  });

  it('returns "ascending" for active column with asc direction', () => {
    expect(getAriaSort("amount", "asc")).toBe("ascending");
  });

  it('returns "descending" for active column with desc direction', () => {
    expect(getAriaSort("amount", "desc")).toBe("descending");
  });

  it('returns "descending" for yield column desc', () => {
    expect(getAriaSort("yield", "desc")).toBe("descending");
  });

  it('returns "ascending" for maturity column asc', () => {
    expect(getAriaSort("maturity", "asc")).toBe("ascending");
  });
});

// ─── 2. getSortAnnouncement ──────────────────────────────────────────────

describe("getSortAnnouncement", () => {
  it("returns empty string when no column is active", () => {
    expect(getSortAnnouncement("", "desc")).toBe("");
  });

  it("returns formatted announcement for amount ascending", () => {
    expect(getSortAnnouncement("amount", "asc")).toBe("Sorted by Amount ascending");
  });

  it("returns formatted announcement for amount descending", () => {
    expect(getSortAnnouncement("amount", "desc")).toBe("Sorted by Amount descending");
  });

  it("returns formatted announcement for yield ascending", () => {
    expect(getSortAnnouncement("yield", "asc")).toBe("Sorted by Yield ascending");
  });

  it("returns formatted announcement for yield descending", () => {
    expect(getSortAnnouncement("yield", "desc")).toBe("Sorted by Yield descending");
  });

  it("returns formatted announcement for maturity ascending", () => {
    expect(getSortAnnouncement("maturity", "asc")).toBe("Sorted by Maturity ascending");
  });

  it("returns formatted announcement for maturity descending", () => {
    expect(getSortAnnouncement("maturity", "desc")).toBe("Sorted by Maturity descending");
  });

  it("falls back to raw column name when not found in SORT_OPTIONS", () => {
    expect(getSortAnnouncement("unknown_col", "asc")).toBe("Sorted by unknown_col ascending");
  });
});

// ─── 3. InvoiceFilters fieldset aria-sort ────────────────────────────────

describe("InvoiceFilters fieldset aria-sort", () => {
  it('renders aria-sort="none" when no sort column is selected', () => {
    render(
      <InvoiceFilters
        filters={BASE}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );

    const fieldset = screen.getByRole("group", { name: "Sort Options" });
    expect(fieldset).toHaveAttribute("aria-sort", "none");
  });

  it('renders aria-sort="ascending" when amount is sorted ascending', () => {
    render(
      <InvoiceFilters
        filters={filtersWith({ sort: "amount", sortDir: "asc" })}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );

    const fieldset = screen.getByRole("group", { name: "Sort Options" });
    expect(fieldset).toHaveAttribute("aria-sort", "ascending");
  });

  it('renders aria-sort="descending" when amount is sorted descending', () => {
    render(
      <InvoiceFilters
        filters={filtersWith({ sort: "amount", sortDir: "desc" })}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );

    const fieldset = screen.getByRole("group", { name: "Sort Options" });
    expect(fieldset).toHaveAttribute("aria-sort", "descending");
  });

  it('renders aria-sort="ascending" when yield is sorted ascending', () => {
    render(
      <InvoiceFilters
        filters={filtersWith({ sort: "yield", sortDir: "asc" })}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );

    const fieldset = screen.getByRole("group", { name: "Sort Options" });
    expect(fieldset).toHaveAttribute("aria-sort", "ascending");
  });

  it('renders aria-sort="descending" when yield is sorted descending', () => {
    render(
      <InvoiceFilters
        filters={filtersWith({ sort: "yield", sortDir: "desc" })}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );

    const fieldset = screen.getByRole("group", { name: "Sort Options" });
    expect(fieldset).toHaveAttribute("aria-sort", "descending");
  });

  it('renders aria-sort="descending" for legacy compound sort values (yield_desc)', () => {
    render(
      <InvoiceFilters
        filters={filtersWith({ sort: "yield_desc" })}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );

    const fieldset = screen.getByRole("group", { name: "Sort Options" });
    expect(fieldset).toHaveAttribute("aria-sort", "descending");
  });

  it('renders aria-sort="ascending" for legacy compound sort values (amount_asc)', () => {
    render(
      <InvoiceFilters
        filters={filtersWith({ sort: "amount_asc" })}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );

    const fieldset = screen.getByRole("group", { name: "Sort Options" });
    expect(fieldset).toHaveAttribute("aria-sort", "ascending");
  });

  it("only one aria-sort is active at a time — the fieldset itself", () => {
    render(
      <InvoiceFilters
        filters={filtersWith({ sort: "amount", sortDir: "asc" })}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );

    // There should be exactly one element with aria-sort that is not "none"
    const activeAriaSort = document.querySelectorAll('[aria-sort]:not([aria-sort="none"])');
    expect(activeAriaSort).toHaveLength(1);

    // That element should be the fieldset
    expect(activeAriaSort[0].tagName).toBe("FIELDSET");
  });
});

// ─── 4. DirectionToggle aria-label describes the action ──────────────────

describe("DirectionToggle accessible name", () => {
  it('shows "Sort amount ascending" when amount active and dir=desc', () => {
    render(
      <InvoiceFilters
        filters={filtersWith({ sort: "amount", sortDir: "desc" })}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );
    expect(screen.getByLabelText("Sort amount ascending")).toBeInTheDocument();
  });

  it('shows "Sort amount descending" when amount active and dir=asc', () => {
    render(
      <InvoiceFilters
        filters={filtersWith({ sort: "amount", sortDir: "asc" })}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );
    expect(screen.getByLabelText("Sort amount descending")).toBeInTheDocument();
  });

  it('shows "Sort yield ascending" when yield active and dir=desc', () => {
    render(
      <InvoiceFilters
        filters={filtersWith({ sort: "yield", sortDir: "desc" })}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );
    expect(screen.getByLabelText("Sort yield ascending")).toBeInTheDocument();
  });

  it('shows "Sort yield descending" when yield active and dir=asc', () => {
    render(
      <InvoiceFilters
        filters={filtersWith({ sort: "yield", sortDir: "asc" })}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );
    expect(screen.getByLabelText("Sort yield descending")).toBeInTheDocument();
  });

  it("inactive toggles describe the field, not an action direction", () => {
    render(
      <InvoiceFilters
        filters={filtersWith({ sort: "amount", sortDir: "desc" })}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );
    // yield toggle is inactive — should have a generic "direction" label
    expect(screen.getByLabelText("Sort yield direction")).toBeInTheDocument();
  });

  it('inactive toggles show "direction" labels for all SORTABLE_COLUMNS when no sort', () => {
    render(
      <InvoiceFilters
        filters={BASE}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );
    expect(screen.getByLabelText("Sort amount direction")).toBeInTheDocument();
    expect(screen.getByLabelText("Sort yield direction")).toBeInTheDocument();
  });
});

// ─── 5. Sort live region ─────────────────────────────────────────────────

describe("sort live region", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it("renders a polite live region for sort announcements", () => {
    render(
      <InvoiceFilters
        filters={BASE}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );

    const region = screen.getByTestId("sort-live-region");
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveAttribute("aria-atomic", "true");
    expect(region).toHaveAttribute("role", "status");
  });

  it("is visually hidden via sr-only", () => {
    render(
      <InvoiceFilters
        filters={BASE}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );

    const region = screen.getByTestId("sort-live-region");
    expect(region).toHaveClass("sr-only");
  });

  it("starts empty when no sort is active", () => {
    render(
      <InvoiceFilters
        filters={BASE}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );

    const region = screen.getByTestId("sort-live-region");
    expect(region).toHaveTextContent("");
  });

  it("announces sort when component mounts with an active sort", () => {
    render(
      <InvoiceFilters
        filters={filtersWith({ sort: "amount", sortDir: "desc" })}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );

    const region = screen.getByTestId("sort-live-region");
    expect(region).toHaveTextContent("Sorted by Amount descending");
  });

  it("announces sort change when sort column changes", () => {
    const handleChange = jest.fn();
    const { rerender } = render(
      <InvoiceFilters
        filters={filtersWith({ sort: "amount", sortDir: "desc" })}
        onFilterChange={handleChange}
        onClearFilters={() => {}}
      />
    );

    // Simulate parent updating state — rerender with new sort
    rerender(
      <InvoiceFilters
        filters={filtersWith({ sort: "yield", sortDir: "desc" })}
        onFilterChange={handleChange}
        onClearFilters={() => {}}
      />
    );

    const region = screen.getByTestId("sort-live-region");
    expect(region).toHaveTextContent("Sorted by Yield descending");
  });

  it("announces direction flip from descending to ascending", () => {
    const handleChange = jest.fn();
    const { rerender } = render(
      <InvoiceFilters
        filters={filtersWith({ sort: "amount", sortDir: "desc" })}
        onFilterChange={handleChange}
        onClearFilters={() => {}}
      />
    );

    rerender(
      <InvoiceFilters
        filters={filtersWith({ sort: "amount", sortDir: "asc" })}
        onFilterChange={handleChange}
        onClearFilters={() => {}}
      />
    );

    const region = screen.getByTestId("sort-live-region");
    expect(region).toHaveTextContent("Sorted by Amount ascending");
  });

  it("does not duplicate the existing results-summary announcement", () => {
    // The sort live region should only announce sort changes,
    // not result counts like "Showing X of Y invoices"
    render(
      <InvoiceFilters
        filters={filtersWith({ sort: "yield", sortDir: "asc" })}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );

    const region = screen.getByTestId("sort-live-region");
    expect(region.textContent).not.toMatch(/Showing/i);
    expect(region.textContent).not.toMatch(/invoices/i);
  });

  it("does not re-announce when sort is cleared (keeps previous message)", () => {
    const handleChange = jest.fn();
    const { rerender } = render(
      <InvoiceFilters
        filters={filtersWith({ sort: "amount", sortDir: "desc" })}
        onFilterChange={handleChange}
        onClearFilters={() => {}}
      />
    );

    rerender(
      <InvoiceFilters
        filters={BASE}
        onFilterChange={handleChange}
        onClearFilters={() => {}}
      />
    );

    // After clearing sort, the announcement stays as the last non-empty one
    // (polite regions don't re-announce empty strings, and we want to avoid
    //  announcing "no sort" which is noise)
    const region = screen.getByTestId("sort-live-region");
    // When sort is cleared, getSortAnnouncement returns "", so liveMessage is not updated;
    // the region keeps its last message (which is fine — screen readers won't announce it again)
    expect(region).toHaveTextContent("Sorted by Amount descending");
  });
});

// ─── 6. aria-sort transitions ────────────────────────────────────────────

describe("aria-sort transitions", () => {
  it('transitions from "none" → "ascending" when sort is first applied', () => {
    const { rerender } = render(
      <InvoiceFilters
        filters={BASE}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );

    const fieldset = screen.getByRole("group", { name: "Sort Options" });
    expect(fieldset).toHaveAttribute("aria-sort", "none");

    rerender(
      <InvoiceFilters
        filters={filtersWith({ sort: "yield", sortDir: "asc" })}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );

    expect(fieldset).toHaveAttribute("aria-sort", "ascending");
  });

  it('transitions from "descending" → "ascending" on direction toggle', () => {
    const { rerender } = render(
      <InvoiceFilters
        filters={filtersWith({ sort: "amount", sortDir: "desc" })}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );

    const fieldset = screen.getByRole("group", { name: "Sort Options" });
    expect(fieldset).toHaveAttribute("aria-sort", "descending");

    rerender(
      <InvoiceFilters
        filters={filtersWith({ sort: "amount", sortDir: "asc" })}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );

    expect(fieldset).toHaveAttribute("aria-sort", "ascending");
  });

  it('transitions from "ascending" → "descending" on direction toggle', () => {
    const { rerender } = render(
      <InvoiceFilters
        filters={filtersWith({ sort: "yield", sortDir: "asc" })}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );

    const fieldset = screen.getByRole("group", { name: "Sort Options" });
    expect(fieldset).toHaveAttribute("aria-sort", "ascending");

    rerender(
      <InvoiceFilters
        filters={filtersWith({ sort: "yield", sortDir: "desc" })}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );

    expect(fieldset).toHaveAttribute("aria-sort", "descending");
  });

  it('returns to "none" when sort is cleared', () => {
    const { rerender } = render(
      <InvoiceFilters
        filters={filtersWith({ sort: "yield", sortDir: "desc" })}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );

    const fieldset = screen.getByRole("group", { name: "Sort Options" });
    expect(fieldset).toHaveAttribute("aria-sort", "descending");

    rerender(
      <InvoiceFilters
        filters={BASE}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );

    expect(fieldset).toHaveAttribute("aria-sort", "none");
  });

  it("only the sort fieldset carries aria-sort — other fieldsets do not", () => {
    render(
      <InvoiceFilters
        filters={filtersWith({ sort: "amount", sortDir: "asc" })}
        onFilterChange={() => {}}
        onClearFilters={() => {}}
      />
    );

    const allFieldsets = document.querySelectorAll("fieldset");
    const fieldsetsWithAriaSort = document.querySelectorAll(
      'fieldset[aria-sort="ascending"], fieldset[aria-sort="descending"]'
    );

    // Only the sort fieldset should have an active aria-sort
    expect(fieldsetsWithAriaSort).toHaveLength(1);
    // There are other fieldsets (yield, currency, maturity) without aria-sort
    expect(allFieldsets.length).toBeGreaterThanOrEqual(4);
  });
});
