<script>
  import dayjs from 'dayjs';
  import { globalHistory } from 'svelte-routing/src/history';
  import { onMount } from 'svelte';
  import { _, language } from '../i18n';
  import { genAvatarUrl } from '../helpers';
  import Spinner from '../Spinner.svelte';

  let loader = true;
  let initFinished = false;
  let messagesUsers = [];
  const limit = 50;
  export let page = 0;
  export let userId;

  function createDate(datetime) {
    if (datetime == null) {
      return '';
    }
    return dayjs().to(dayjs(`${datetime}Z`));
  }

  async function checkActiveUser(newUserId, init) {
    if (!(init || initFinished)) {
      return;
    }
    if (userId != null && messagesUsers.filter(user => user.id === newUserId).length === 0) {
      const userResponse = await fetch(
        `/api/v3/users/${newUserId}?lang=${$language}`,
        { credentials: 'same-origin' },
      );
      const { user } = await userResponse.json();
      messagesUsers.unshift({ ...user, new_messages_count: 0 });
      messagesUsers = messagesUsers;
    }
  }

  async function loadMessagesUsers() {
    const response = await fetch(
      `/api/v3/profile/messages:users?offset=${page * limit}&limit=${limit}&lang=${$language}`,
      { credentials: 'same-origin' },
    );
    ({ 'messages:user': messagesUsers } = await response.json());
    await checkActiveUser(userId, true);
    loader = false;
    initFinished = true;
  }

  $: checkActiveUser(userId);

  onMount(loadMessagesUsers);
</script>


{#if loader}
  <div class="spinner">
    <Spinner />
  </div>
{/if}

{#each messagesUsers as user}
  <div class="user-row"
       class:active={userId === user.id}
       on:click={() => globalHistory.navigate(`/profile/messages/${user.id}?lang=${$language}`)}
  >
    <img src="{genAvatarUrl(user)}"
        alt="{user.name} avatar"
        title="{$_('profile')}">
    
    <div class="name">
      {user.name}
      <div class="last-date">{createDate(user.last_datetime)}</div>
    </div>

    {#if user.new_messages_count}
      <div class="count">
        {user.new_messages_count}
      </div>
    {/if}
  </div>
{/each}

<style>
  .user-row {
    display: flex;
    align-content: center;
    align-items: center;
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    cursor: pointer;
  }

  .user-row:first-child {
    margin-top: 0.5rem;
  }
  
  .user-row:last-child {
    margin-bottom: 0.5rem;
  }

  .user-row:hover {
    background-color: var(--messages-users-row-hover);
  }

  .user-row.active {
    background-color: var(--messages-users-row-hover);
  }

  .user-row > img {
    border-radius: 10px;
    max-width: 3rem;
    min-width: 3rem;
    max-height: 3rem;
  }

  .user-row .name {
    margin-left: 0.5rem;
    color: var(--messages-users-name);
  }

  .user-row .count {
    margin-left: auto;
    background-color: var(--messages-users-count-background);
    color: var(--messages-users-count);
    border-radius: 1.5rem;
    min-width: 1.5rem;
    height: 1.5rem;
    text-align: center;
    line-height: 1.5rem;
    vertical-align: middle;
  }

  .user-row .last-date {
    font-size: 10pt;
    color: var(--messages-users-date);
  } 

  .spinner {
    text-align: center;
  }
</style>