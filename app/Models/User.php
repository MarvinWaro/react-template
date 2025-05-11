<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'avatar',
        'email',
        'password',
        'activated_at',
        'superstaff',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'deleted_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_user', 'user_id', 'role_id')
            ->wherePivotNull('deleted_at');
    }

    public function hasAdminRole(): bool
    {
        return $this->roles()->where('for_admin', true)->exists();
    }

    public function isSuperStaff(): bool
    {
        return $this->superstaff;
    }

    public function modulePermissions()
    {
        return ModulePermission::whereIn('role_id', function ($query) {
            $query->select('role_id')
                ->from('role_user')
                ->where('user_id', $this->id)
                ->whereNull('deleted_at');
        })
            ->whereNull('deleted_at');
    }

    public static function booted()
    {
        static::creating(function ($user) {
            $user->id = (string) Str::uuid();
        });
    }
}
