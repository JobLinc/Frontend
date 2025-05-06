import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PageChatSystem from "@chatComponent/PageChat/PageChatSystem";

vi.mock("@services/api/ChatSocket", () => ({
  connectToChat: vi.fn(),
  disconnectChatSocket: vi.fn(),
  onConnect: vi.fn((callback) => {
    setTimeout(() => callback(true), 0); // Automatically call the callback with true
    return vi.fn();
  }),
}));

vi.mock("@services/api/chatServices", () => ({
  BlockMessaging: vi.fn().mockResolvedValue(true),
}));

// Mock context providers
vi.mock("@context/ChatIdProvider", () => ({
  default: () => ({
    setChatId: vi.fn(),
  }),
}));

vi.mock("@context/NetworkUserIdProvider", () => ({
  default: () => ({
    setUsersId: vi.fn(),
  }),
}));

vi.mock("@chatComponent/ChatCardsList", () => ({
  __esModule: true,
  default: () => <div data-testid="chat-list">Mocked ChatCardsList</div>,
}));

vi.mock("@chatComponent/NetWorksChatList", () => ({
  __esModule: true,
  default: () => <div>Mocked NetWorksChatList</div>,
}));

vi.mock("@chatComponent/PageChat/PageChatWindow", () => ({
  default: (props) => (
    <div data-testid="page-message-window" data-chatname={props.chatName}>
      Message Window
    </div>
  ),
}));

vi.mock("@chatComponent/PageChat/ConnectionsSidebar", () => ({
  default: (props) =>
    props.isOpen ? (
      <div data-testid="connections-sidebar">
        <button data-testid="close-sidebar" onClick={props.onClose}>
          Close
        </button>
      </div>
    ) : null,
}));

vi.mock("@chatComponent/UI/SearchBar", () => ({
  default: (props) => (
    <div data-testid="search-bar" className={props.className}>
      <input
        data-testid="search-input"
        onChange={(e) => props.onChange(e.target.value)}
        onFocus={props.FocusToggler}
        onBlur={props.FocusToggler}
      />
    </div>
  ),
}));

describe("PageChatSystem", () => {
  it("renders ChatCardsList with mocked useState", async () => {
    vi.mock("react", async () => {
      let call = 0;
      const actual = await vi.importActual<typeof import("react")>("react");
      return {
        ...actual,
        useState: vi.fn(() => {
          const mockedStates = [
            [false, vi.fn()], // isFocused
            [true, vi.fn()], // isSidebarOpen (opened)
            [true, vi.fn()], // isChatSidebarOpen
            ["", vi.fn()], // searchTerm
            ["", vi.fn()], // opnedChatName
            [true, vi.fn()], // isConnected
            [false, vi.fn()], // isMobileView
            [false, vi.fn()], // menuOpen
            [false, vi.fn()], // showBlockConfirmation
          ];
          const state = mockedStates[call % mockedStates.length];
          call++;
          return state;
        }),
      };
    });
    render(<PageChatSystem />);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
    expect(screen.getByText("Messaging")).toBeInTheDocument();
    expect(screen.getByTestId("chat-list")).toBeInTheDocument();
    expect(screen.getByTestId("page-message-window")).toBeInTheDocument();
  });
});
