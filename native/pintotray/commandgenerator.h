#ifndef COMMANDGENERATOR_H
#define COMMANDGENERATOR_H

#include <QObject>
#include <QSystemTrayIcon>

class MessageWriter;

/**
 * Generator of commands to be sent from the native module to the extension.
 */
class CommandGenerator : public QObject {
    Q_OBJECT
public:
    /**
     * @param messageWriter The message writer to which to send the commands.
     */
    CommandGenerator(MessageWriter& messageWriter, QObject* parent = nullptr);

public slots:
    /**
     * Send the command to handle an icon activation (typically on click).
     * @param id The identifier of the icon. This maps to the tab ID.
     * @param reason What caused the icon to be activated.
     */
    void iconActivated(int id, QSystemTrayIcon::ActivationReason reason = QSystemTrayIcon::ActivationReason::Unknown);

    /**
     * Send the command to unpin a tab.
     * @param id The identifier of the icon. This maps to the tab ID.
     */
    void unpinRequested(int id);

private:
    MessageWriter& messageWriter;
};

#endif // COMMANDGENERATOR_H
