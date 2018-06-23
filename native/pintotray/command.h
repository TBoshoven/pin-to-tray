#ifndef COMMAND_H
#define COMMAND_H

#include <QString>

class CommandGenerator;
class QJsonObject;

/**
 * A command that is received by the native application.
 */
class Command {
public:
    /**
     * @return The name of the command, as communicated to the application.
     */
    virtual QString name() const = 0;

    /**
     * Execute the command.
     *
     * @param parameters The JSON input for the command.
     * @param messageWriter The message writer for any possible command output.
     */
    virtual void operator()(const QJsonObject& parameters, CommandGenerator& commandGenerator) const = 0;
};

#endif // COMMAND_H
