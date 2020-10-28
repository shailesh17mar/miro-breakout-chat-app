<script lang="ts">
	import type {Message} from '../../interfaces/chat'
	export let message: Message
	export let currentUserId: string
</script>

<div class="message__container">
	{#if message.authorId === currentUserId}
		<div class="message__body right">
				{#each message.message as text, index}
					<div class="message__content message__mine">
						<p class="message__text">{text}</p>
						<div class="onhover">{message.timestamp.toLocaleTimeString().slice(0, 4)}</div>
					</div>
				{/each}
		</div>
	{:else}
		<div class="message__author">
			<img alt="thumbnail" src={ `https://miro.com/api/v1/users/${message.authorId}/picture?rnd=1&size=44` } class="message__thumbnail" />
		</div>
	<div class="message__body">
			{#each message.message as text, index}
				<div class="message__content">
						{#if index === 0}
							<div class="message__header">
								<strong>{decodeURIComponent(message.author)}</strong>
							</div>
						{/if}
						<p class="message__text">{text}</p>
						<div class="onhover">{message.timestamp.toLocaleTimeString().slice(0, 4)}</div>
				</div>
			{/each}
	</div>

	{/if}
	</div>

<style>
	.message__container {
		display: flex;
        width: 100%;
		margin: 6px 0;
	}
	.message__content .onhover{
		display: none;
	}

	.message__content:hover .onhover{
		display:block;
		position: absolute;
		bottom:8px;
		font-size: 12px;
		color: #827F9B;
		right:0;
	}

	.message__author {
		align-self: flex-end;
	}

	.message__header {
		/* padding: 8px; */
		padding-bottom:8px;
	}

	.message__body {
		width: 100%;
		position: relative;
	}
	.message__content {
		width: 80%;
		background: #EBEBEF;
		border-radius: 4px;
		padding: 8px;
		margin-bottom: 4px;
	}

	.message__mine{
		width: calc(100% - 40px);
		background:#3F53D9;
		color: #fff;
		margin-left: 40px;
	}
	.message__mine:hover .onhover{
		display:block;
		position: absolute;
		bottom:8px;
		font-size: 12px;
		color: #827F9B;
		left:0;
	}

	.right{
		margin-left: auto;
	}

	.message__text {
		/* margin: 6px 0px 0px 0px; */
		/* padding: 8px; */
		padding-top:4px;
		padding:0;
		margin:0;
	}

	.message__thumbnail{
		width: 24px;
		height: 24px;
		margin-right: 4px;
		margin-bottom: 4px;
		border-radius: 50%;
	}
</style>
