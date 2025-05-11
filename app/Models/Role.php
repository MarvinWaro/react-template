<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Role extends Model
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name',
        'description',
        'for_admin'
    ];

    protected $hidden = [
        'deleted_at',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'role_user', 'role_id', 'user_id')
            ->wherePivotNull('deleted_at');
    }

    public function modules()
    {
        return $this->belongsToMany(Module::class, 'role_module', 'role_id', 'module_id')
            ->wherePivotNull('deleted_at');
    }

    public function roleUsers()
    {
        return $this->hasMany(RoleUser::class, 'role_id');
    }

    public function modulePermissions()
    {
        return $this->hasMany(ModulePermission::class, 'role_id');
    }

    public static function booted()
    {
        static::creating(function ($table) {
            $table->id = (string) Str::uuid();
        });

        static::deleting(function ($table) {
            $table->roleUsers()->delete();
        });
    }
}
