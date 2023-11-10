const Chat = {
    name: 'Chat',
    properties: {
        id: {type: 'string', indexed: true, optional: false},
        created_at: {type: 'date', default: null},
        recipient_id: {type: 'string', default: null},
        recipient_username: {type: 'string', default: null},
        recipient_email: {type: 'string', default: null},        
        recipient_profile_pic: {type: 'string', default: null},
    }
}

export default Chat