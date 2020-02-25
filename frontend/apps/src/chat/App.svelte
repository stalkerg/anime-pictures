<script>
  /* eslint no-use-before-define: ["error", { "functions": false }] */
  /* eslint no-alert: off */
  /* eslint no-restricted-globals: ["error", "event"] */
  import { onMount, onDestroy, tick } from 'svelte';
  import { _ } from '../i18n';
  import { showNotification, genAvatarUrl, requestNotificationPermission } from '../helpers';
  import BBTags from '../BBTags.svelte';
  import Users from './Users.svelte';
  import Messages from './Messages.svelte';
  import Spinner from '../Spinner.svelte';


  let chatWs = null;
  let reconnectTimer;
  let myUser;
  let users;
  let messages = [];
  let disableInput = true;
  let text = '';
  let textarea;
  let usersLastEventTime = {};
  let editMessageId = null;
  let waitLoadMore = false;
  let loader = true;

  function onOpen() {
    console.log('Open socket');
    disableInput = false;
  }

  function reconnect() {
    let protocol = 'wss://';
    if (window.location.hostname === 'localhost') {
      protocol = 'ws://';
    }
    if (chatWs == null || chatWs.readyState === WebSocket.CLOSED) {
      chatWs = new WebSocket(`${protocol}${window.location.hostname}/ap-chat?lang=${window.lang}`);
      chatWs.onopen = onOpen;
      chatWs.onmessage = onMessage;
      chatWs.onclose = onMessage;
    }
    if (chatWs && chatWs.readyState === WebSocket.OPEN) {
      clearInterval(reconnectTimer);
    }
  }

  function onMessage(evt) {
    if (evt.type === 'close') {
      console.log('Close event');
      disableInput = true;
      messages = [];
      users = [];
      reconnectTimer = setInterval(reconnect, 2000);
      return;
    }

    const data = JSON.parse(evt.data);
    console.log(data.type);
    if (data.type === 'all_users') {
      users = data.users;
      [myUser] = users.filter(user => user.iam === true);
      usersLastEventTime = Object.fromEntries(
        users.map(user => [user.id, new Date()]),
      );
    } else if (data.type === 'last_messages') {
      messages = data.messages.map((currentValue, index, array) => {
        if (index !== 0) {
          return { ...currentValue, prev: array[index - 1] };
        }
        return currentValue;
      });
      loader = false;
    } else if (data.type === 'new_user') {
      users.push(data.user);
      users = users;
    } else if (data.type === 'del_user') {
      users = users.filter(user => user.id !== data.user_id);
      delete usersLastEventTime[data.user_id];
    } else if (data.type === 'new_message') {
      if (messages.length > 0) {
        messages[0].prev = data.message;
      }
      messages = [data.message, ...messages];

      if (messages.length > 150) {
        messages.pop();
      }

      if (data.message.user.id !== myUser.id && data.message.id !== -1) {
        showNotification(
          $_('New message'),
          'new_message',
          data.message.raw_text,
          genAvatarUrl(data.message.user),
        );
      }
      usersLastEventTime[data.message.user.id] = new Date();
    } else if (data.type === 'delete_message') {
      console.log(messages, data.message_id);
      messages = messages
        .filter(message => message.id !== data.message_id)
        .map((currentValue, index, array) => {
          if (index !== 0) {
            return { ...currentValue, prev: array[index - 1] };
          }
          return currentValue;
        });
    } else if (data.type === 'edit_message') {
      messages = messages.map((message) => {
        if (message.id === data.message_id) {
          return { ...message, text: data.text, raw_text: data.raw_text };
        }

        return message;
      });
    } else if (data.type === 'active_chat_window') {
      usersLastEventTime[data.user_id].last_event_time = new Date();
    } else if (data.type === 'load_more') {
      messages = [...messages, ...data.messages].map((currentValue, index, array) => {
        if (index !== 0) {
          return { ...currentValue, prev: array[index - 1] };
        }
        return currentValue;
      });
      waitLoadMore = false;
    }
  }

  function sendMessage() {
    if (text.trim() === '') {
      return;
    }
    disableInput = true;
    tick();
    if (editMessageId == null) {
      chatWs.send(JSON.stringify({
        type: 'new_message',
        message: text,
      }));
    } else {
      chatWs.send(JSON.stringify({
        type: 'edit_message',
        message: text,
        message_id: editMessageId,
      }));
    }
    text = '';
    editMessageId = null;
    disableInput = false;
    requestNotificationPermission();
  }

  function keydownHandle(event) {
    const keynum = event.which || event.keyCode;
    if ((event.ctrlKey || event.metaKey) && keynum === 13) {
      sendMessage();
    }
  }

  function sendActivateChatWindow() {
    if (chatWs == null || chatWs.readyState === WebSocket.CLOSED) {
      console.log('Send active_chat_window');
      chatWs.send(JSON.stringify({ type: 'active_chat_window' }));
    }
  }

  let updateUsersTimeInterval;
  function updateUsersTime() {
    usersLastEventTime = { ...usersLastEventTime };
  }

  function editMessage(event) {
    text = event.detail.raw_text;
    editMessageId = event.detail.id;
  }

  function cancelEditMessage() {
    text = '';
    editMessageId = null;
  }

  function deleteMessage(event) {
    if (confirm('You are sure?')) {
      chatWs.send(JSON.stringify({
        type: 'delete_message',
        message_id: event.detail,
      }));
    }
  }

  function setTextareaFocus() {
    textarea.focus();
    textarea.setSelectionRange(1000, 1000);
  }

  function putUserName({ detail }) {
    if (text.indexOf(detail.name) === 0) {
      return;
    }
    text = `${detail.name}, ${text}`;
    setTextareaFocus();
  }

  function loadMore() {
    if (messages.length > 0 && !waitLoadMore) {
      chatWs.send(JSON.stringify({
        type: 'load_more',
        after_id: messages[messages.length - 1].id,
      }));
      waitLoadMore = true;
    }
  }

  function cleanLatest(event) {
    messages = messages.slice(0, messages.length - event.detail);
  }

  onMount(() => {
    reconnect();
    updateUsersTimeInterval = setInterval(updateUsersTime, 10000);
  });

  onDestroy(() => {
    clearInterval(updateUsersTimeInterval);
  });
</script>

<svelte:window on:focus={sendActivateChatWindow} />

<style>
  .chat-main-block {
    margin-left: 0;
    margin-top: 10px;
    width: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0 10px;
  }

  .sidebar {
    min-width: 300px;
    padding-top: 10px;
    padding-right: 5px;
  }

  .chat-messages {
    height: 100%;
    min-height: 0;
  }

  textarea {
    width: 100%;
    height: 50px;
    padding: 0;
    margin: 10px 0;
    resize: none;
  }

  textarea.is-edit {
    box-shadow: 0 0 2px 1px #ff5959;
    border-style: none;
  }

  .first-line {
    display: flex;
    align-content: center;
    justify-content: space-between;
  }

  .input button {
    border: none;
    border-radius: 3px;
    padding: .3rem .5rem;
    font-weight: 400;
    color: #2f2f2f;
    background: #d5d5d5;
    cursor: pointer;
  }

  .spinner {
    text-align: center;
  }

  @media all and (max-width: 1000px) {
    .chat-main-block {
      margin-top: 0;
    }

    .sidebar {
      display: none;
    }
  }
</style>

<div class="chat-main-block">
  <div class="input">
    <div class="first-line">
      <BBTags disable={disableInput} {textarea} bind:text={text} />
      <div>
        <button disabled={disableInput}
                on:click|stopPropagation={sendMessage}
        >{$_('Send')} (Ctrl+Enter)</button>
        {#if editMessageId != null}
          <button on:click|stopPropagation={cancelEditMessage}>{$_('Cancel')}</button>
        {/if}
      </div>
    </div>
    <textarea disabled={disableInput}
              onblur="return false;"
              class:is-edit={editMessageId}
              on:keydown={keydownHandle}
              bind:this={textarea}
              bind:value={text}></textarea>
  </div>
  {#if loader}
    <div class="spinner">
      <Spinner />
    </div>
  {/if}
  <div class="chat-messages">
    <Messages {messages}
              {myUser}
              {editMessageId}
              on:editMessage={editMessage}
              on:deleteMessage={deleteMessage}
              on:putUserName={putUserName}
              on:loadMore={loadMore}
              on:cleanLatest={cleanLatest}
    />
  </div>
  {#if waitLoadMore}
    <div class="spinner">
      <Spinner />
    </div>
  {/if}
</div>

<div class="sidebar">
  <Users {users}
         {usersLastEventTime}
         on:putUserName={putUserName}
  />
</div>