#ifndef COMMANDHANDLER_H
#define COMMANDHANDLER_H

#include "command.h"

#include <QMap>
#include <QObject>
#include <QSharedPointer>

class CommandGenerator;
class MessageReader;

/**
 * Handler for incoming commands from the extension.
 */
class CommandHandler : public QObject {
    Q_OBJECT
public:
    /**
     * @param messageReader Message reader that receives the commands.
     * @param commandGenerator Command generator to be used for follow-up commands.
     */
    CommandHandler(MessageReader& messageReader, CommandGenerator& commandGenerator, QObject* parent = nullptr);

    /**
     * Convenience function for registering a command.
     *
     * This function constructs the command and registers it.
     *
     * @tparam CommandType The type of command to register.
     * @tparam ParamTypes The types of the parameters to pass to the constructor.
     * @param params The parameters to pass to the constructor of the command class.
     */
    template <class CommandType, class... ParamTypes>
    void registerCommand(ParamTypes... params);

    /**
      Register an instantiated command.

     * @param command The command to register.
     */
    void registerCommand(const QSharedPointer<Command>& command);

public slots:
    /**
     * @param command The name of the command to execute.
     * @param parameters The parameters to the command as a JSON object.
     */
    void handle(const QString& command, const QJsonObject& parameters);

private:
    CommandGenerator& commandGenerator;
    QMap<QString, QSharedPointer<Command>> commands;
};

template <class CommandType, class... ParamTypes>
void CommandHandler::registerCommand(ParamTypes... params) {
    registerCommand(QSharedPointer<Command>(new CommandType(params...)));
}

#endif // COMMANDHANDLER_H
