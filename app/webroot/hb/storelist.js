{{#each stores}}
	<!--
	<h1>{{this.Storeinstance.length}} global and {{this.Localinstance.length}} local instance(s) of {{this.Storename.name}}</h1>
	-->
	
	<div class='store storename-{{this.Storename.id}}'>

		<h2>{{this.Storename.name}}</h2>
		<p>Price range: {{this.Pricerange.range}}</p>
		<p>Icons: 
			<span class='commas'>
			{{#each this.Icon}}
				<span>{{iconLongName}}</span>
			{{/each}}
			</span>
		</p>

	{{#if_gt this.Localinstance.length compare=1}}
		<!-- MULTIPLE LOCAL INSTANCES -->
		{{#each this.Localinstance}}
			<h3>Instance {{this.id}} in location {{this.location_id}}</h3>
			<p>Address: {{this.storeAddress1}}<br>{{this.storeAddress2}}</p>
			<p>Store hours: {{this.storeHours}}</p>
		{{/each}}
	{{else}}
		<!-- ONE LOCAL INSTANCE -->
		<p>Address: {{this.Storeinstance.0.storeAddress1}}<br>{{this.Storeinstance.0.storeAddress2}}</p>
		<p>Store hours: {{this.Storeinstance.0.storeHours}}</p>
	{{/if_gt}}
	</div>
{{/each}}