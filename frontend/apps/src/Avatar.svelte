<script>
  import { genAvatarUrl } from './helpers';
  import { _, language } from './i18n';

  export let user;
</script>

<div class="avatar">
  <img src="{genAvatarUrl(user)}"
        alt="{user.name} avatar"
        title="{$_('profile')}"
        on:mouseup|preventDefault={() => window.open(`/profile/view_ext_profile/${user.id}?lang=${$language}`)}>
</div>

<style>
  .avatar {
    margin-right: 1.0rem;
    margin-left: 0.5rem;
    width: 4rem;
    max-width: 4rem;
    min-width: 4rem;
    text-align: center;
  }

  .avatar img {
    max-width: 100%;
    cursor: pointer;
  }
</style>