<script>
  import { createEventDispatcher } from 'svelte';
  import dayjs from 'dayjs';
  import { _, language } from '../i18n';
  import { genAvatarUrl } from '../helpers';

  export let users = [];
  export let usersLastEventTime = {};

  const dispatch = createEventDispatcher();
</script>

<style>
  .chat-user-block {
    text-align: center;
    margin-bottom: 1rem;
  }

  .user-status {
    font-size: 14px;
    font-weight: 200;
    color: #555;
  }

  .user-name {
    cursor: pointer;
  }

  .body {
    padding-top: 1rem;
  }
</style>

<div class="sidebar_block">
  <div class="title">{$_('Chat users')}</div>
  <div class="body">
    {#each users as user}
      <div class="chat-user-block">
        <img src="{genAvatarUrl(user)}" alt="{user.name} avatar">
        <div>
          <span class="user-name"
                on:click={() => dispatch('putUserName', user)}
          >{user.name}</span> |
          <a href="/profile/view_ext_profile/{user.id}?lang={$language}">{$_('profile')}</a>
          <br>
          <span class="user-status">{dayjs().to(dayjs(usersLastEventTime[user.id]))}</span>
        </div>
      </div>
    {/each}
  </div>
</div>