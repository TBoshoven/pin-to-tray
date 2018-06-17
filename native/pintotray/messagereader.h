#ifndef MESSAGEREADER_H
#define MESSAGEREADER_H

#include <QJsonObject>
#include <QThread>

/**
 * Input for messages from the extension.
 */
class MessageReader : public QThread {
    Q_OBJECT
public:
    MessageReader(QObject* parent = nullptr);

signals:
    /**
     * A new message is read.
     *
     * @param command The name of the command that is read.
     * @param parameters The parameters to the command, represented as a JSON object.
     */
    void messageRead(QString command, QJsonObject parameters);

protected:
    void run() override;
};

#endif // MESSAGEREADER_H
