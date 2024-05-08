<div></div>

<style lang="scss">
	div {
		border: 2px solid rgba(255, 255, 255, 0.5); /* Light grey */
		border-top: 2px solid white; /* Blue */
		border-radius: 50%;
		width: 1.2rem;
		height: 1.2rem;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
</style>