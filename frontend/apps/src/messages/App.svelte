<script>
  // import { Router, Link, Route } from 'svelte-routing';
  import { onMount } from 'svelte';
  import { globalHistory } from 'svelte-routing/src/history';
  import { _, language } from '../i18n';
  import Users from './Users.svelte';
  import Messages from './Messages.svelte';

  let userId = null;
  let messagesDom;
  function event({ location }) {
    if (location.pathname.startsWith('/profile/messages')) {
      const newUserId = location.pathname.split('/')[3];
      if (newUserId) {
        userId = parseInt(newUserId, 10);
      } else {
        userId = null;
      }
    }
  }

  onMount(() => {
    globalHistory.listen(event);
    event(globalHistory, 'init');
  });
  
  function setUserId({ detail }) {
    userId = detail;
  }
</script>

<div class="post_content">
  <div class="title">
    {#if userId != null}
      <span class="icon icon_hamburger" on:click={() => globalHistory.navigate(`/profile/messages?lang=${$language}`)}></span>
    {/if}
    {$_('Messages')}
  </div>
  <div class="messages-body">
    <div class="app-users" class:on-top={userId == null}>
      <Users on:userId={setUserId} {userId} />
    </div>
    <div class="app-messages" class:on-top={userId != null} bind:this={messagesDom}>
      <Messages {userId} parentDiv={messagesDom} />
    </div>
  </div>
</div>

<style>
  .post_content {
    min-width: 100%;
    padding: 0;
    margin-left: 10px;
  }

  .messages-body {
    display: flex;
    align-content: center;
  }

  .app-users {
    background-color: var(--messages-users-background);
    min-width: 20rem;
    display: flex;
    flex-direction: column;
    max-height: 700px;
    overflow-y: auto;
    box-shadow: 2px 0 4px 0 var(--messages-users-shadow);
    z-index: 10;
    transition: width 0.5s, min-width 0.5s;
  }

  .app-messages {
    max-height: 700px;
    overflow-y: auto;
    width: 100%;
    transition: width 0.5s;
  }

  .title {
    vertical-align: middle;
  }

  .title .icon {
    width: 20px;
    height: 20px;
    margin-bottom: -1px;
    margin-right: 0.5rem;
    display: none;
    cursor: pointer;
  }

  @media all and (max-width: 1000px) {
    .post_content {
      margin-left: 0;
    }

    .app-users {
      min-width: 0;
      width: 0;
      max-height: none;
    }

    .app-users.on-top {
      width: 100%;
    }

    .app-messages {
      width: 0;
      overflow-y: none;
      max-height: none;
    }

    .app-messages.on-top {
      width: 100%;
    }

    .title .icon {
      display: inline-block;
    }
  }
</style>