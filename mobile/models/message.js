const Message = {
    name: 'Message',
    properties: {
        id: {type: 'string', indexed: true, optional: false},
        chat_id: {type: 'string', default: null, optional: true},
        created_at: {type: 'date', default: null, optional: true},
        sender_id: {type: 'string', default: null, optional: true},
        recipient_id: {type: 'string', default: null, optional: true},
        attachments: {type: 'list', objectType: 'string', default: null},
        content: {type: 'string', default: null, optional: true},        
        reply_to: {type: 'string', default: null, optional: true},
        status: {type: 'string', default: null, optional: true},
        duplicate: {type: 'bool', default: false, optional: true},
    }
}

export default Message