import { createRealmContext } from '@realm/react'
import Chat from "./chat"
import Message from './message'

export const { RealmProvider, useObject, useQuery, useRealm } = createRealmContext({
    schema: [
        Chat,
        Message
    ],
})
