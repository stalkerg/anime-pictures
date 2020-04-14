<script>
  import dayjs from 'dayjs';
  import { language, _ } from '../i18n';
  import Spinner from '../Spinner.svelte';
  import Separator from '../Separator.svelte';
  import Avatar from '../Avatar.svelte';
  import Paginator from '../Paginator.svelte';
  import EditMessage from './EditMessage.svelte';


  export let userId = null;
  let lastUserId = null;
  export let parentDiv;
  let page = 0;
  let loader = true;
  let messages = [];
  let count = 0;
  const limit = 20;
  
  function createDate(datetime) {
    return dayjs().to(dayjs(`${datetime}Z`));
  }

  async function loadMessages() {
    if (userId == null) {
      messages = [];
      return;
    }
    if (lastUserId !== userId) {
      page = 0;
    }
    const response = await fetch(
      `/api/v3/users/${userId}/messages?offset=${page * limit}&limit=${limit}&lang=${$language}`,
      { credentials: 'same-origin' },
    );
    ({ messages, count } = await response.json());
    lastUserId = userId;
    messages = messages.map((currentValue, index, array) => {
      if (index !== 0) {
        return { ...currentValue, prev: array[index - 1] };
      }
      return currentValue;
    });
    loader = false;
  }

  function addMessage({ detail }) {
    const message = detail;
    if (messages.length > 0) {
      messages[0].prev = message;
    }
    messages = [message, ...messages];
  }

  function setPage(p) {
    parentDiv.scroll(0, 0);
    page = p;
  }

  async function markRead(messageId) {
    let response;
    try {
      response = await fetch(
        `/api/v3/users/${userId}/messages/${messageId}`,
        {
          credentials: 'same-origin',
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            not_read: false,
          }),
        },
      );
    } catch (error) {
      console.log(error);
      return;
    }

    const responseJson = await response.json();
    if (!responseJson.success) {
      console.error(responseJson.errormsg);
      return;
    }

    messages = messages.map(({ message, user, prev }) => {
      if (message.id === messageId) {
        return {
          message: { ...message, not_read: false },
          user,
          prev,
        };
      }
      return { message, user, prev };
    });
  }

  $: loadMessages(userId, page);
</script>

{#if userId != null}
  <EditMessage {userId} on:addMessage={addMessage} />
  {#if loader}
    <div class="spinner">
      <Spinner />
    </div>
  {/if}
  {#if count > 0}
    <Paginator {page} {count} {limit} on:setPage={({ detail }) => setPage(detail)} />
  {/if}
  <div>
    {#each messages as {message, user, prev}, index (message.id)}
      <Separator prevDate={prev ? `${prev.message.datetime}Z` : null} currentDate={`${message.datetime}Z`} />
      <div class="message-row" class:unread={message.not_read}>
        <Avatar {user} />
        <div class="message-text">
          <div class="message-text-head">
            <span class="name">{user.name}</span>
            <span class="sub-text">{createDate(message.datetime)}</span>
          </div>
          <div class="message-body">
            {@html message.html}
            <div>
              {#if message.not_read && message.to_user === window.db_user_id}
                <a href="/profile/message_mark_read/{message.id}"
                   on:click|preventDefault={() => markRead(message.id)}
                >{$_('Mark read')}</a>
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>
  {#if count > 0}
    <Paginator {page} {count} {limit} on:setPage={({ detail }) => setPage(detail)} />
  {/if}
{/if}

<style>
  .spinner {
    text-align: center;
  }

  .message-row {
    display: flex;
    align-content: center;
    margin-top: 0.5rem;
  }
  .unread {
    background-color: var(--messages-unread-background);
  }
  .message-text {
    position: relative;
    width: 100%;
    min-width: 50%;
    padding-right: 0.5rem;
  }

  .message-text-head {
    margin-bottom: 0.5rem;
    font-weight: 700;
  }

  .message-body {
    word-wrap: break-word;
    max-width: 100%;
  }

  .message-body :global(img) {
    max-width: 100%;
  }

  .message-body :global(.code) {
    overflow: auto;
  }
</style>