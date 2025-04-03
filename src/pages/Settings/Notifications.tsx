import SettingsSection from "./SettingsSection";

function Notifications ()
{
    return (
        <>
            <SettingsSection title="Notifications you receive" items={[
                "Searching for a job",
                "Hiring someone",
                "Connecting with others",
                "Network catch-up updates",
                "Posting and commenting",
                "Messaging",
                "Groups",
                "Pages",
                "Attending events",
                "News and reports",
                "Updating your profile",
                "Verifications",
                "Games"
            ]} />

            
        </>
    );
}

export default Notifications;