import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddParticipantsModal from "@components/chat/GroupSetting/modals/AddParticipantsModal";
import { vi } from "vitest";
import { getConnections } from "@services/api/chatServices";

vi.mock("@services/api/chatServices", () => ({
  getConnections: vi.fn(),
}));

const mockConnections = [
  {
    id: "1",
    firstname: "John",
    lastname: "Doe",
    profilePicture: "url1",
    mutualConnections: 3,
  },
  {
    id: "2",
    firstname: "Jane",
    lastname: "Smith",
    profilePicture: "url2",
    headline: "Developer",
  },
];

const mockProps = {
  chatId: "chat123",
  onCancel: vi.fn(),
  onConfirm: vi.fn(),
  modalRef: { current: null },
};

describe("AddParticipantsModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders initial state correctly", () => {
    render(<AddParticipantsModal {...mockProps} />);

    expect(screen.getByText("Add Group Participants")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search connections..."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
  });

  test("shows loading state initially", () => {
    render(<AddParticipantsModal {...mockProps} />);

    expect(screen.getByText("Loading your connections...")).toBeInTheDocument();
  });

  test("displays connections after successful fetch", async () => {
    (getConnections as vi.Mock).mockResolvedValue(mockConnections);

    render(<AddParticipantsModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("3 mutual connections")).toBeInTheDocument();
    });
  });

  test("shows error message when fetch fails", async () => {
    (getConnections as vi.Mock).mockRejectedValue(new Error("API error"));

    render(<AddParticipantsModal {...mockProps} />);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load connections. Please try again."),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Try Again" }),
      ).toBeInTheDocument();
    });
  });

  test("allows retrying after failed fetch", async () => {
    (getConnections as vi.Mock)
      .mockRejectedValueOnce(new Error("API error"))
      .mockResolvedValueOnce(mockConnections);

    render(<AddParticipantsModal {...mockProps} />);

    const retryButton = await screen.findByRole("button", {
      name: "Try Again",
    });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(getConnections).toHaveBeenCalledTimes(2);
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });

  test("filters connections based on search input", async () => {
    (getConnections as vi.Mock).mockResolvedValue(mockConnections);

    render(<AddParticipantsModal {...mockProps} />);

    await waitFor(() => screen.getByText("John Doe"));

    const searchInput = screen.getByPlaceholderText("Search connections...");
    fireEvent.change(searchInput, { target: { value: "Jane" } });

    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  test("toggles user selection", async () => {
    (getConnections as vi.Mock).mockResolvedValue(mockConnections);

    render(<AddParticipantsModal {...mockProps} />);

    await waitFor(() => screen.getByText("John Doe"));

    const firstUser = screen.getByText("John Doe").closest("div");
    if (firstUser) fireEvent.click(firstUser);

    expect(screen.getByRole("button", { name: "Add (1)" })).toBeEnabled();

    fireEvent.click(firstUser!);
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
  });

  test("calls onConfirm with selected user IDs", async () => {
    (getConnections as vi.Mock).mockResolvedValue(mockConnections);

    render(<AddParticipantsModal {...mockProps} />);

    await waitFor(() => screen.getByText("John Doe"));
    fireEvent.click(screen.getByText("John Doe").closest("div")!);
    fireEvent.click(screen.getByRole("button", { name: "Add (1)" }));

    expect(mockProps.onConfirm).toHaveBeenCalledWith(["1"]);
  });

  test("handles empty connections list", async () => {
    (getConnections as vi.Mock).mockResolvedValue([]);

    render(<AddParticipantsModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText("No connections available")).toBeInTheDocument();
    });
  });

  test("resets state after confirmation", async () => {
    (getConnections as vi.Mock).mockResolvedValue(mockConnections);

    const { rerender } = render(<AddParticipantsModal {...mockProps} />);

    await waitFor(() => screen.getByText("John Doe"));
    fireEvent.click(screen.getByText("John Doe").closest("div")!);
    fireEvent.click(screen.getByRole("button", { name: "Add (1)" }));

    // Re-render with same props to simulate modal reopening
    rerender(<AddParticipantsModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
    });
  });
});
