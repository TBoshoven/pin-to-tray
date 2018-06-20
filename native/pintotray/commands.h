#ifndef COMMANDS_H
#define COMMANDS_H

#include "command.h"

class QApplication;
class TrayManager;

namespace Commands {

/**
 * Base class for commands that are related to manipulating icons.
 */
class IconCommand : public Command {
public:
    /**
     * @param trayManager The tray manager that manages the icons.
     */
    IconCommand(TrayManager& trayManager);

    /**
     * Execute the command, extracting the icon ID from the parameters.
     *
     * @param parameters The JSON input for the command. Must contain an "id" key.
     * @param messageWriter The message writer for any possible command output.
     */
    virtual void operator()(const QJsonObject& parameters, MessageWriter& messageWriter) const override;

    /**
     * Execute the command.
     *
     * @param id The identifier of the icon to manipulate.
     * @param parameters The JSON input for the command.
     * @param messageWriter The message writer for any possible command output.
     */
    virtual void operator()(int id, const QJsonObject& parameters, MessageWriter& messageWriter) const = 0;

protected:
    TrayManager& trayManager;
};

/**
 * Command to update an icon's image.
 */
class UpdateIcon : public IconCommand {
public:
    UpdateIcon(TrayManager& trayManager);
    virtual QString name() const override;
    virtual void operator()(int id, const QJsonObject& parameters, MessageWriter& messageWriter) const override;
};

/**
 * Command to update an icon's title.
 */
class UpdateTitle : public IconCommand {
public:
    UpdateTitle(TrayManager& trayManager);
    virtual QString name() const override;
    virtual void operator()(int id, const QJsonObject& parameters, MessageWriter& messageWriter) const override;
};

/**
 * Command to update an icon's title.
 */
class HighlightIcon : public IconCommand {
public:
    HighlightIcon(TrayManager& trayManager);
    virtual QString name() const override;
    virtual void operator()(int id, const QJsonObject& parameters, MessageWriter& messageWriter) const override;
};

/**
 * Command to hide (remove) an icon.
 */
class HideIcon : public IconCommand {
public:
    HideIcon(TrayManager& trayManager);
    virtual QString name() const override;
    virtual void operator()(int id, const QJsonObject& parameters, MessageWriter& messageWriter) const override;
};

/**
 * Command to exit the application.
 *
 * The is not typically used except for debugging purposes.
 */
class Exit : public Command {
public:
    Exit(QApplication& application);
    virtual QString name() const override;
    virtual void operator()(const QJsonObject& parameters, MessageWriter& messageWriter) const override;

private:
    QApplication& application;
};
} // namespace Commands

#endif // COMMANDS_H
