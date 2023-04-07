<?php

namespace App\Providers;

use App\TrfExplorer\Utils;
use Closure;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\ServiceProvider;
use URL;

class AppServiceProvider extends ServiceProvider
{

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register(): void
    {
        if ($this->app->environment('local')) {
            $this->app->register(\Laravel\Telescope\TelescopeServiceProvider::class);
            $this->app->register(TelescopeServiceProvider::class);
        }
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot(): void
    {
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
        Model::preventLazyLoading(!app()->runningInConsole());
        Model::preventsSilentlyDiscardingAttributes();
        EloquentBuilder::macro(
            'cachedPaginate',
            function ($perPage = null, $columns = ['*'], $pageName = 'page', $page = null) {
                $cacheValidity = config('trfuniverse.paginator_cache_validity');
                $page = $page ?: Paginator::resolveCurrentPage($pageName);
                $requestHash = Utils::hashArray(request()?->except([$pageName]));
                $queryHash = Utils::hashArray([$this->toSql(), $this->getBindings()]);
                $baseCacheKey = "pagination:{$queryHash}:{$requestHash}";
                $dataCacheKey = "{$baseCacheKey}:$page:data";
                $totalCacheKey = "{$baseCacheKey}:total";

                $total = cache()->remember(
                    $totalCacheKey,
                    now()->addMinutes($cacheValidity),
                    function () {
                        return $this->toBase()->getCountForPagination();
                    }
                );

                if ($perPage instanceof Closure) {
                    $perPage = $perPage($total);
                }
                if (!$perPage) {
                    $perPage = $this->model->getPerPage();
                }

                $results = cache()->remember(
                    $dataCacheKey,
                    now()->addMinutes($cacheValidity),
                    function () use ($total, $page, $perPage, $columns) {
                        return $total ? $this->forPage($page, $perPage)->get($columns) : $this->model->newCollection();
                    }
                );

                return $this->paginator(
                    $results,
                    $total,
                    $perPage,
                    $page,
                    [
                        'path'     => Paginator::resolveCurrentPath(),
                        'pageName' => $pageName,
                    ]
                );
            }
        );
    }
}
