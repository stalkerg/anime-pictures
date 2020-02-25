<script>
  import dayjs from 'dayjs';
  import VirtualList from '@sveltejs/svelte-virtual-list';
  import { createEventDispatcher } from 'svelte';
  import { genAvatarUrl } from '../helpers';
  import { _, language } from '../i18n';
  import Separator from '../Separator.svelte';

  export let messages = [];
  export let myUser = {};
  export let editMessageId;
  export let end;

  const dispatch = createEventDispatcher();
  
  function createDate(message) {
    return dayjs().to(dayjs(message.datetime));
  }

  function editMessage(message) {
    dispatch('editMessage', {
      id: message.id,
      raw_text: message.raw_text,
    });
  }

  function deleteMessage(message) {
    dispatch('deleteMessage', message.id);
  }

  function checkBottomBorder(bottomIndex) {
    if (messages.length === bottomIndex) {
      dispatch('loadMore');
    }

    if (bottomIndex < messages.length - 50) {
      dispatch('cleanLatest', 50);
    }
  }
  $: checkBottomBorder(end);
</script>

<style>
  .chat-row {
    display: flex;
    align-content: center;
    margin-top: 0.5rem;
    /* border-bottom: 1px solid #d5d5d5; */
  }

  .chat-avatar {
    margin-right: 1.0rem;
    margin-left: 0.5rem;
    width: 4rem;
    max-width: 4rem;
    /* min-height: 5rem; */
    text-align: center;
  }

  .chat-avatar img {
    max-width: 100%;
    cursor: pointer;
    /* border-radius: 50%; */
  }

  .chat-text {
    position: relative;
    width: 100%;
    padding-right: 0.5rem;
  }

  .chat-text-head {
    margin-bottom: 0.5rem;
    font-weight: 700;
  }

  .chat-text-head .name {
    cursor: pointer;
  }

  .controls {
    position: absolute;
    right: 0.5rem;
    top: 0;
    height: 100%;
  }

  .edit {
    width: 20px;
    height: 20px;
    cursor: pointer;
    display: block;
  }

  .delete {
    width: 20px;
    height: 20px;
    cursor: pointer;
    display: block;
  }

  .hide {
    display: none;
  }
</style>

<VirtualList items={messages} bind:end let:item>
  <Separator prevDate={item.prev ? item.prev.datetime : null}
             currentDate={item.datetime}
             isEdit={editMessageId === item.id}
             showToday={false}/>
  <div class="chat-row">
    <div class="chat-avatar sub-text">
      <img src="{genAvatarUrl(item.user)}"
           alt="{item.user.name} avatar"
           title="{$_('profile')}"
           on:mouseup|preventDefault={() => window.open(`/profile/view_ext_profile/${item.user.id}?lang=${$language}`)}>
      <!-- <a href="/profile/view_ext_profile/{item.user.id}?lang={$language}">{$_('profile')}</a> -->
    </div>
    <div class="chat-text">
      <div class="chat-text-head">
        <span class="name" on:click={() => dispatch('putUserName', item.user)}>{item.user.name}</span>
        <span class="sub-text">{createDate(item)}</span>
      </div>
      {@html item.text}
      <div class="controls">
        <span class="edit icon_edit_big"
              class:hide={item.id === -1 || myUser.id !== item.user.id}
              on:click={() => editMessage(item)}></span>
        <span class="delete icon_delete_big"
              class:hide={item.id === -1 || !myUser.ismoderator}
              on:click={() => deleteMessage(item)}></span>
      </div>
    </div>
  </div>
</VirtualList>