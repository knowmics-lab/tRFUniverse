<x-mail::message>
# Analysis completed

Your {{ $analysisType }} analysis has been completed.

@if($url)
<x-mail::button :url="$url">Click here to see the results</x-mail::button>
@else
If you wish to see the results, please connect to our website.
@endif

Thanks,<br>
The {{ config('app.name') }} Team
</x-mail::message>
