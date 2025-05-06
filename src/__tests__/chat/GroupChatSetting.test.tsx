import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GroupChatSetting from "@components/chat/GroupSetting/GroupChatSetting";
import { User } from "@components/chat/interfaces/User.interfaces";
import {
  addParticipants,
  removeParticipants,
} from "@services/api/chatServices";

// Mock the API functions
vi.mock("@services/api/chatServices", () => ({
  addParticipants: vi.fn(),
  removeParticipants: vi.fn(),
}));

const mockUsers: User[] = [
  {
    userId: "1",
    firstName: "John",
    lastName: "Doe",
    profilePicture: "john.jpg",
    isRemoved: false,
  },
  {
    userId: "2",
    firstName: "Alice",
    lastName: "Smith",
    profilePicture: "alice.jpg",
    isRemoved: false,
  },
  {
    userId: "3",
    firstName: "Bob",
    lastName: "Brown",
    profilePicture: "bob.jpg",
    isRemoved: true,
  },
];

const mockSetUsers = vi.fn();

describe("GroupChatSetting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <GroupChatSetting
        users={mockUsers}
        setUsers={mockSetUsers}
        chatId="test-chat"
      />,
    );

  it("renders the settings button initially", () => {
    renderComponent();
    expect(screen.getByLabelText("Group settings")).toBeInTheDocument();
  });

  it("opens the panel when settings button is clicked", async () => {
    renderComponent();
    const settingsButton = screen.getByLabelText("Group settings");

    await userEvent.click(settingsButton);
    expect(screen.getByText("Group Information")).toBeInTheDocument();
  });

  it("displays correct number of participants", async () => {
    renderComponent();
    await userEvent.click(screen.getByLabelText("Group settings"));

    // Should show 2 participants (Bob is removed)
    expect(screen.getByText("Participants (2)")).toBeInTheDocument();
  });

  it("opens Add Participants modal when clicked", async () => {
    renderComponent();
    await userEvent.click(screen.getByLabelText("Group settings"));
    await userEvent.click(screen.getByText("Add Participants"));

    expect(screen.getByText("Add Group Participants")).toBeInTheDocument();
  });

  it("opens Remove Participants modal when clicked", async () => {
    renderComponent();
    await userEvent.click(screen.getByLabelText("Group settings"));
    await userEvent.click(screen.getByText("Remove Participants"));

    expect(screen.getByText("Remove Group Participants")).toBeInTheDocument();
  });
});
